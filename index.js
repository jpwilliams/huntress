const { EventEmitter } = require('events')
const { RecursiveProxy } = require('./lib/RecursiveProxy')

exports.createWatcher = function createWatcher (state = {}) {
  const emitter = new EventEmitter()
  const tracker = track.bind(null, emitter)
  const untracker = untrack.bind(null, emitter)

  return RecursiveProxy(emitter, {
    track: tracker,
    untrack: untracker
  }, [], state)
}

exports.Watcher = exports.createWatcher()

function track (emitter, bits, callback) {
  emitter.on(bits.join('.'), callback)
}

function untrack (emitter, bits, fn) {
  emitter.removeListener(bits.join('.'), fn)
}
