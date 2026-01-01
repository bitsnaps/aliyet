import { readMultipartFormData } from 'h3';
import path from 'path';
import { promises as fs } from 'fs';

export default defineEventHandler(async (event) => {
  const machineId = getRouterParam(event, 'id')
  if (!machineId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Machine ID is required',
    })
  }

  const form = await readMultipartFormData(event)
  if (!form || form.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file provided',
    })
  }

  const file = form.find(f => f.name === 'image')
  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image field "image" is required',
    })
  }

  const allowedTypes = ['image/png', 'image/jpeg']
  if (!allowedTypes.includes(file.type)) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Unsupported Media Type. Only PNG and JPG are allowed.',
    })
  }

  const maxBytes = 2 * 1024 * 1024
  if (file.data?.length > maxBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: 'File too large. Max size is 2MB.',
    })
  }

  const ext = file.type === 'image/png' ? '.png' : '.jpg'
  const uploadsDir = useUploadDir('machines')
  const filename = `${machineId}-main-${Date.now()}${ext}`
  const fullPath = path.join(uploadsDir, filename)
  const publicUrl = `/images/machines/${filename}`

  try {
    const { models } = await useDB()
    const { Machines } = models

    const machine = await Machines.findByPk(machineId)
    if (!machine) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Machine not found',
      })
    }

    await fs.mkdir(uploadsDir, { recursive: true })
    await fs.writeFile(fullPath, file.data)

    // Delete old image if exists
    const oldImageUrl = machine.metadata?.imageUrl
    if (oldImageUrl) {
      const oldFilename = path.basename(oldImageUrl)
      const oldFullPath = path.join(uploadsDir, oldFilename)
      try {
        await fs.unlink(oldFullPath)
      } catch (e) {
        console.warn('Failed to delete old image:', e.message)
      }
    }

    const metadata = machine.metadata || {}
    metadata.imageUrl = publicUrl
    await machine.update({ metadata })

    return {
      success: true,
      data: { imageUrl: publicUrl }
    }
  } catch (error) {
    console.error('Image upload error:', error)
    if (error.statusCode === 404) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
