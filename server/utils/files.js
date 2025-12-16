import path from 'path'

/**
 * Resolves the upload directory based on UPLOAD_DIR environment variable.
 * Defaults to 'public/images' if not set.
 * Handles both relative (to process.cwd()) and absolute paths.
 * 
 * @param {string} [subpath=''] - Optional subpath to append (e.g. 'machines')
 * @returns {string} The absolute path to the upload directory
 */
export const useUploadDir = (subpath = '') => {
  const uploadDir = process.env.UPLOAD_DIR || 'public/images'
  
  const baseDir = path.isAbsolute(uploadDir)
    ? uploadDir
    : path.join(process.cwd(), uploadDir)
    
  return subpath ? path.join(baseDir, subpath) : baseDir
}
