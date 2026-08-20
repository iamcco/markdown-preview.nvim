const crypto = require('crypto')

// Version hash of file content. read_source returns it to the client; the
// client echoes it back on write_source so the server can detect that the
// file changed on disk while the editor held a stale copy.
function computeContentHash (content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

function checkWriteConflict (currentContent, baselineHash) {
  const currentHash = computeContentHash(currentContent)
  if (!baselineHash) {
    return { conflict: false, currentHash }
  }
  return { conflict: currentHash !== baselineHash, currentHash }
}

module.exports = {
  computeContentHash,
  checkWriteConflict
}
