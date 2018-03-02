const { EventEmitter } = require('events')

class EagerEmitter extends EventEmitter {
  constructor (props) {
    super(props)
    this.cache = {}
  }

  emit (eventName, ...args) {
    this.cache[eventName] = args

    return super.emit(eventName, ...args)
  }

  on (eventName, listener) {
    if (this.cache.hasOwnProperty(eventName)) {
      listener(...this.cache[eventName])
    }

    return super.on(eventName, listener)
  }
}

exports.EagerEmitter = EagerEmitter
