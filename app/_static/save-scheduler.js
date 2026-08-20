/*
 * Save scheduler for the annotator source editor.
 *
 * Guarantees:
 *  - saves never run concurrently
 *  - a change or manual save arriving while a save is in flight is buffered
 *    and runs after the in-flight save settles (success or failure)
 *  - changes are debounced; a manual save cancels the pending debounce
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.MdpSaveScheduler = factory()
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function createSaveScheduler (options) {
    var save = options.save
    var debounceMs = typeof options.debounceMs === 'number' ? options.debounceMs : 900
    var setTimeoutFn = options.setTimeoutFn || function (fn, ms) { return setTimeout(fn, ms) }
    var clearTimeoutFn = options.clearTimeoutFn || function (id) { clearTimeout(id) }

    var saving = false
    var pendingChange = false
    var pendingManual = false
    var debounceTimer = null

    function clearDebounce () {
      if (debounceTimer !== null) {
        clearTimeoutFn(debounceTimer)
        debounceTimer = null
      }
    }

    function scheduleDebounced () {
      clearDebounce()
      debounceTimer = setTimeoutFn(function () {
        debounceTimer = null
        runSave()
      }, debounceMs)
    }

    function onSettled () {
      saving = false
      if (pendingManual) {
        pendingManual = false
        pendingChange = false
        runSave()
      } else if (pendingChange) {
        pendingChange = false
        scheduleDebounced()
      }
    }

    function runSave () {
      if (saving) return
      saving = true
      var result
      try {
        result = Promise.resolve(save())
      } catch (e) {
        result = Promise.reject(e)
      }
      result.then(onSettled, onSettled)
    }

    return {
      notifyChange: function () {
        if (saving) {
          pendingChange = true
          return
        }
        scheduleDebounced()
      },
      requestSave: function () {
        if (saving) {
          pendingManual = true
          return
        }
        clearDebounce()
        runSave()
      },
      // Drop all scheduled and buffered work (an in-flight save still settles).
      // Used when the editor's content is about to belong to a different file.
      cancel: function () {
        clearDebounce()
        pendingChange = false
        pendingManual = false
      }
    }
  }

  return { createSaveScheduler: createSaveScheduler }
})
