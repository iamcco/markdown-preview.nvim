const assert = require('assert')
const { computeContentHash, checkWriteConflict } = require('./writeConflict')

function run () {
  // Hash is deterministic and content-sensitive
  {
    const a1 = computeContentHash('# hello\nworld\n')
    const a2 = computeContentHash('# hello\nworld\n')
    const b = computeContentHash('# hello\nworld!\n')
    assert.strictEqual(typeof a1, 'string')
    assert.ok(a1.length > 0)
    assert.strictEqual(a1, a2, 'same content hashes equal')
    assert.notStrictEqual(a1, b, 'different content hashes differ')
  }

  // Multi-byte content (Chinese) hashes on bytes, not truncated chars
  {
    const a = computeContentHash('掩码规则 A')
    const b = computeContentHash('掩码规则 B')
    assert.notStrictEqual(a, b)
  }

  // Baseline matches the file on disk → no conflict
  {
    const content = '# doc\n\nbody\n'
    const baseline = computeContentHash(content)
    const result = checkWriteConflict(content, baseline)
    assert.strictEqual(result.conflict, false)
    assert.strictEqual(result.currentHash, baseline)
  }

  // File changed externally since the editor loaded → conflict
  {
    const loaded = '# doc\n\nbody\n'
    const onDisk = '# doc\n\nbody changed in nvim\n'
    const baseline = computeContentHash(loaded)
    const result = checkWriteConflict(onDisk, baseline)
    assert.strictEqual(result.conflict, true)
    assert.strictEqual(result.currentHash, computeContentHash(onDisk))
  }

  // No baseline supplied (old client / first write) → never conflicts
  {
    assert.strictEqual(checkWriteConflict('anything', undefined).conflict, false)
    assert.strictEqual(checkWriteConflict('anything', null).conflict, false)
    assert.strictEqual(checkWriteConflict('anything', '').conflict, false)
  }
}

if (require.main === module) {
  run()
  console.log('writeConflict.spec: ok')
}

module.exports = {
  run
}
