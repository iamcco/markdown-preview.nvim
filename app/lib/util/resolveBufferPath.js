const path = require('path')

function resolveBufferPath (filePath, nvimCwd) {
  if (typeof filePath !== 'string' || filePath.trim() === '') return filePath
  if (path.isAbsolute(filePath)) return filePath

  if (typeof nvimCwd === 'string' && nvimCwd.trim() !== '') {
    return path.resolve(nvimCwd, filePath)
  }

  return path.resolve(process.cwd(), filePath)
}

module.exports = {
  resolveBufferPath
}
