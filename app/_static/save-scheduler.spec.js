const assert = require('assert')
const { createSaveScheduler } = require('./save-scheduler')

// Deterministic fake timers
function makeTimers () {
  let now = 0
  let nextId = 1
  const timers = new Map()
  return {
    setTimeoutFn (fn, ms) {
      const id = nextId++
      timers.set(id, { at: now + ms, fn })
      return id
    },
    clearTimeoutFn (id) {
      timers.delete(id)
    },
    async advance (ms) {
      now += ms
      for (const [id, t] of [...timers]) {
        if (t.at <= now) {
          timers.delete(id)
          t.fn()
        }
      }
      await settle()
    }
  }
}

// Controllable save fn: each call returns a promise resolved/rejected by the test
function makeSave () {
  const calls = []
  return {
    calls,
    save () {
      return new Promise((resolve, reject) => {
        calls.push({ resolve, reject })
      })
    }
  }
}

function settle () {
  return new Promise(resolve => setImmediate(resolve))
}

async function run () {
  // 1. Changes within the debounce window collapse into one save
  {
    const t = makeTimers()
    const s = makeSave()
    const sched = createSaveScheduler({
      save: s.save,
      debounceMs: 900,
      setTimeoutFn: t.setTimeoutFn,
      clearTimeoutFn: t.clearTimeoutFn
    })
    sched.notifyChange()
    await t.advance(300)
    sched.notifyChange()
    await t.advance(300)
    sched.notifyChange()
    assert.strictEqual(s.calls.length, 0, 'no save before debounce elapses')
    await t.advance(900)
    assert.strictEqual(s.calls.length, 1, 'exactly one save after debounce')
  }

  // 2. Manual save runs immediately and cancels the scheduled auto-save
  {
    const t = makeTimers()
    const s = makeSave()
    const sched = createSaveScheduler({
      save: s.save,
      debounceMs: 900,
      setTimeoutFn: t.setTimeoutFn,
      clearTimeoutFn: t.clearTimeoutFn
    })
    sched.notifyChange()
    sched.requestSave()
    assert.strictEqual(s.calls.length, 1, 'manual save fires immediately')
    s.calls[0].resolve()
    await settle()
    await t.advance(2000)
    assert.strictEqual(s.calls.length, 1, 'debounced save was cancelled')
  }

  // 3. A change arriving while a save is in flight is not lost:
  //    a follow-up save runs (debounced) after the in-flight one completes
  {
    const t = makeTimers()
    const s = makeSave()
    const sched = createSaveScheduler({
      save: s.save,
      debounceMs: 900,
      setTimeoutFn: t.setTimeoutFn,
      clearTimeoutFn: t.clearTimeoutFn
    })
    sched.notifyChange()
    await t.advance(900)
    assert.strictEqual(s.calls.length, 1)
    sched.notifyChange() // arrives mid-flight
    await t.advance(900) // debounce elapses while still saving
    assert.strictEqual(s.calls.length, 1, 'no concurrent save while one is in flight')
    s.calls[0].resolve()
    await settle()
    await t.advance(900)
    assert.strictEqual(s.calls.length, 2, 'follow-up save runs after in-flight completes')
  }

  // 4. Manual save during in-flight save runs exactly once afterwards
  {
    const t = makeTimers()
    const s = makeSave()
    const sched = createSaveScheduler({
      save: s.save,
      debounceMs: 900,
      setTimeoutFn: t.setTimeoutFn,
      clearTimeoutFn: t.clearTimeoutFn
    })
    sched.requestSave()
    assert.strictEqual(s.calls.length, 1)
    sched.requestSave()
    sched.requestSave()
    assert.strictEqual(s.calls.length, 1, 'no concurrent manual save')
    s.calls[0].resolve()
    await settle()
    assert.strictEqual(s.calls.length, 2, 'one pending manual save runs immediately after')
    s.calls[1].resolve()
    await settle()
    await t.advance(3000)
    assert.strictEqual(s.calls.length, 2, 'pending manual saves collapse into one')
  }

  // 5. A failed save does not wedge the scheduler
  {
    const t = makeTimers()
    const s = makeSave()
    const sched = createSaveScheduler({
      save: s.save,
      debounceMs: 900,
      setTimeoutFn: t.setTimeoutFn,
      clearTimeoutFn: t.clearTimeoutFn
    })
    sched.requestSave()
    s.calls[0].reject(new Error('boom'))
    await settle()
    sched.requestSave()
    assert.strictEqual(s.calls.length, 2, 'scheduler accepts saves after a failure')
  }

  // 6. Change buffered during a save that then fails is still not lost
  {
    const t = makeTimers()
    const s = makeSave()
    const sched = createSaveScheduler({
      save: s.save,
      debounceMs: 900,
      setTimeoutFn: t.setTimeoutFn,
      clearTimeoutFn: t.clearTimeoutFn
    })
    sched.notifyChange()
    await t.advance(900)
    sched.notifyChange() // mid-flight
    s.calls[0].reject(new Error('boom'))
    await settle()
    await t.advance(900)
    assert.strictEqual(s.calls.length, 2, 'buffered change still saved after failure')
  }
  // 7. cancel() drops a scheduled auto-save (e.g. switching to another file)
  {
    const t = makeTimers()
    const s = makeSave()
    const sched = createSaveScheduler({
      save: s.save,
      debounceMs: 900,
      setTimeoutFn: t.setTimeoutFn,
      clearTimeoutFn: t.clearTimeoutFn
    })
    sched.notifyChange()
    sched.cancel()
    await t.advance(3000)
    assert.strictEqual(s.calls.length, 0, 'cancelled scheduled save never fires')
  }

  // 8. cancel() during an in-flight save drops buffered work; the in-flight
  //    save itself still settles normally
  {
    const t = makeTimers()
    const s = makeSave()
    const sched = createSaveScheduler({
      save: s.save,
      debounceMs: 900,
      setTimeoutFn: t.setTimeoutFn,
      clearTimeoutFn: t.clearTimeoutFn
    })
    sched.requestSave()
    sched.notifyChange() // buffered mid-flight
    sched.requestSave() // buffered mid-flight
    sched.cancel()
    s.calls[0].resolve()
    await settle()
    await t.advance(3000)
    assert.strictEqual(s.calls.length, 1, 'buffered work dropped by cancel')
    sched.notifyChange()
    await t.advance(900)
    assert.strictEqual(s.calls.length, 2, 'scheduler still usable after cancel')
  }
}

if (require.main === module) {
  run().then(() => {
    console.log('save-scheduler.spec: ok')
  }, (err) => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = {
  run
}
