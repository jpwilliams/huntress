const { EagerEmitter } = require('./lib/EagerEmitter')
const { RecursiveProxy } = require('./lib/RecursiveProxy')

exports.createWatcher = function createWatcher (state = {}) {
  const tracker = track.bind(null, emitter)
  const untracker = untrack.bind(null, emitter)
  const emitter = new EagerEmitter()

  return RecursiveProxy(emitter, {
    track: tracker,
    untrack: untracker
  }, [], state)
}

exports.Watcher = exports.createWatcher()

function track (emitter, bits, callback) {
  emitter.on(genPath(bits), callback)
}

function untrack (emitter, bits, fn) {
  emitter.removeListener(genPath(bits), fn)
}

function genPath (bits) {
  return Array.isArray(bits)
      ? bits.join('.')
      : bits.replace(/\[(.+?)\]/g, '.$1')
}
