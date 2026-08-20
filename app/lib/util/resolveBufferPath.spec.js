const assert = require('assert')
const { resolveBufferPath } = require('./resolveBufferPath')

function run () {
  assert.strictEqual(resolveBufferPath('/tmp/a.md', '/work'), '/tmp/a.md')
  assert.strictEqual(resolveBufferPath('notes/today.md', '/work'), '/work/notes/today.md')
  assert.strictEqual(resolveBufferPath('./doc.md', '/work'), '/work/doc.md')
}

if (require.main === module) {
  run()
  console.log('resolveBufferPath.spec: ok')
}

module.exports = { run }
