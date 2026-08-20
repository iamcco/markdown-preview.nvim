const assert = require('assert')
const { splitFrontmatter, joinFrontmatter } = require('./frontmatter')

function run () {
  // Document with YAML frontmatter: split into raw header block + body,
  // and the round trip reproduces the original byte-for-byte
  {
    const content = '---\ntitle: "PII 与掩码"\ntags: [security]\n---\n\n# 正文\n\nbody\n'
    const parts = splitFrontmatter(content)
    assert.strictEqual(parts.frontmatter, '---\ntitle: "PII 与掩码"\ntags: [security]\n---\n')
    assert.strictEqual(parts.body, '\n# 正文\n\nbody\n')
    assert.strictEqual(joinFrontmatter(parts.frontmatter, parts.body), content)
  }

  // No frontmatter → empty header, body is the whole document
  {
    const content = '# just a doc\n\ntext\n'
    const parts = splitFrontmatter(content)
    assert.strictEqual(parts.frontmatter, '')
    assert.strictEqual(parts.body, content)
    assert.strictEqual(joinFrontmatter(parts.frontmatter, parts.body), content)
  }

  // Opening --- with no closing delimiter → treat as no frontmatter (do not eat the doc)
  {
    const content = '---\nthis is actually a thematic break story\n'
    const parts = splitFrontmatter(content)
    assert.strictEqual(parts.frontmatter, '')
    assert.strictEqual(parts.body, content)
  }

  // YAML may close with "..." as well
  {
    const content = '---\na: 1\n...\nbody\n'
    const parts = splitFrontmatter(content)
    assert.strictEqual(parts.frontmatter, '---\na: 1\n...\n')
    assert.strictEqual(parts.body, 'body\n')
    assert.strictEqual(joinFrontmatter(parts.frontmatter, parts.body), content)
  }

  // CRLF line endings survive the round trip
  {
    const content = '---\r\ntitle: x\r\n---\r\nbody\r\n'
    const parts = splitFrontmatter(content)
    assert.strictEqual(parts.frontmatter, '---\r\ntitle: x\r\n---\r\n')
    assert.strictEqual(parts.body, 'body\r\n')
    assert.strictEqual(joinFrontmatter(parts.frontmatter, parts.body), content)
  }

  // Frontmatter-only document (closing delimiter at EOF, no trailing newline)
  {
    const content = '---\na: 1\n---'
    const parts = splitFrontmatter(content)
    assert.strictEqual(parts.frontmatter, '---\na: 1\n---')
    assert.strictEqual(parts.body, '')
    assert.strictEqual(joinFrontmatter(parts.frontmatter, parts.body), content)
  }

  // A --- later in the document is NOT frontmatter
  {
    const content = 'intro\n---\nnot frontmatter\n---\n'
    const parts = splitFrontmatter(content)
    assert.strictEqual(parts.frontmatter, '')
    assert.strictEqual(parts.body, content)
  }
}

if (require.main === module) {
  run()
  console.log('frontmatter.spec: ok')
}

module.exports = {
  run
}
