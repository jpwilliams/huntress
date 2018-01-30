const { EagerEmitter } = require('./lib/EagerEmitter')
const { RecursiveProxy } = require('./lib/RecursiveProxy')

exports.createWatcher = function createWatcher (state = {}) {
  const emitter = new EagerEmitter()

  return RecursiveProxy(emitter, {
    track: track.bind(null, emitter),
    stopTracking: stopTracking.bind(null, emitter)
  }, [], state)
}

exports.Watcher = exports.createWatcher()

function track (emitter, bits, callback) {
  emitter.on(genPath(bits), callback)
}

function stopTracking (emitter, bits, fn) {
  emitter[fn ? 'removeListener' : 'removeAllListeners'](genPath(bits), fn)
}

function genPath (bits) {
  return Array.isArray(bits)
      ? bits.join('.')
      : bits.replace(/\[(.+?)\]/g, '.$1')
}
