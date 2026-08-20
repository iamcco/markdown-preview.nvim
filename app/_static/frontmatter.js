/*
 * YAML frontmatter split/join for the annotator source editor.
 *
 * The WYSIWYG editor has no frontmatter support: fed a `---` header it
 * parses it as thematic breaks + paragraphs and mangles it on
 * re-serialization. So the annotator strips the raw header before loading
 * the editor and splices the identical bytes back on save.
 * joinFrontmatter(splitFrontmatter(c)) === c, always.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.MdpFrontmatter = factory()
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function splitFrontmatter (content) {
    var none = { frontmatter: '', body: content }
    if (typeof content !== 'string') return none

    // Split keeping the delimiters so the original bytes can be rebuilt
    var lines = content.split(/(\r?\n)/)
    // lines: [line0, sep0, line1, sep1, ...]
    if (lines.length === 0 || lines[0].trim() !== '---') return none

    for (var i = 2; i < lines.length; i += 2) {
      var trimmed = lines[i].trim()
      if (trimmed === '---' || trimmed === '...') {
        // Header spans up to and including this line and its line ending (if any)
        var end = i + 1 < lines.length ? i + 2 : i + 1
        return {
          frontmatter: lines.slice(0, end).join(''),
          body: lines.slice(end).join('')
        }
      }
    }
    return none
  }

  function joinFrontmatter (frontmatter, body) {
    return (frontmatter || '') + (body || '')
  }

  return {
    splitFrontmatter: splitFrontmatter,
    joinFrontmatter: joinFrontmatter
  }
})
