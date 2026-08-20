function getMarkdownLinePrefix (line) {
  const prefixMatch = line.match(/^(\s*(?:(?:[-+*]|\d+\.)\s+|#{1,6}\s+|(?:>\s*)+))/)
  return prefixMatch ? prefixMatch[1] : ''
}

function applyLineOverwriteFallback (currentLine, newLineText) {
  const prefix = getMarkdownLinePrefix(currentLine)
  if (prefix) {
    return prefix + newLineText
  }
  return newLineText
}

function applyInlineChangesToContent (content, changes) {
  const lineEnding = content.includes('\r\n') ? '\r\n' : '\n'
  const lines = content.split(/\r?\n/)
  const unapplied = []
  let applied = 0

  for (const change of changes || []) {
    const lineNumber = Number(change && change.line)
    const line = Number.isInteger(lineNumber) ? lineNumber : -1

    if (line < 0 || line >= lines.length) {
      unapplied.push(change)
      continue
    }

    const currentLine = lines[line]
    const oldLineText = typeof change.oldLineText === 'string' ? change.oldLineText : null
    const newLineText = typeof change.newLineText === 'string' ? change.newLineText : null

    if (oldLineText !== null && newLineText !== null && oldLineText !== newLineText) {
      const segmentStart = currentLine.indexOf(oldLineText)
      if (segmentStart !== -1) {
        lines[line] = currentLine.slice(0, segmentStart) + newLineText + currentLine.slice(segmentStart + oldLineText.length)
        applied++
        continue
      }

      const fallbackLine = applyLineOverwriteFallback(currentLine, newLineText)
      if (fallbackLine !== currentLine) {
        lines[line] = fallbackLine
        applied++
        continue
      }
    }

    const oldText = typeof change.oldText === 'string' ? change.oldText : ''
    const newText = typeof change.newText === 'string' ? change.newText : ''
    if (oldText !== '' && currentLine.includes(oldText)) {
      lines[line] = currentLine.replace(oldText, newText)
      applied++
      continue
    }

    unapplied.push(change)
  }

  return {
    applied,
    unapplied,
    content: lines.join(lineEnding)
  }
}

module.exports = {
  applyInlineChangesToContent
}
