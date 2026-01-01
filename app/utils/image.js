export const resizeImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    // If not an image, return original
    if (!file || !file.type.match(/image.*/)) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      const image = new Image()
      image.onload = () => {
        const width = image.width
        const height = image.height

        // If image is smaller than max dimensions, return original
        if (width <= maxWidth && height <= maxHeight) {
          resolve(file)
          return
        }

        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        const newWidth = Math.round(width * ratio)
        const newHeight = Math.round(height * ratio)

        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight
        const ctx = canvas.getContext('2d')
        
        // Better quality scaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        ctx.drawImage(image, 0, 0, newWidth, newHeight)

        canvas.toBlob((blob) => {
          if (!blob) {
            // Fallback to original if blob creation fails
            console.warn('Image resize failed, using original')
            resolve(file)
            return
          }
          
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          })
          resolve(newFile)
        }, file.type, quality)
      }
      
      image.onerror = (err) => {
        console.warn('Image load failed, using original', err)
        resolve(file)
      }
      
      image.src = readerEvent.target.result
    }
    
    reader.onerror = (err) => {
       console.warn('FileReader failed, using original', err)
       resolve(file)
    }
    
    reader.readAsDataURL(file)
  })
}
