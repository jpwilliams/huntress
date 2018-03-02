const { Component, createElement } = require('react')
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

exports.withWatcher = (paths, watcher) => {
  const w = watcher || exports.Watcher

  return WrappedComponent => class extends Component {
    constructor (props) {
      super(props)
      this.fnMap = {}
    }

    componentDidMount () {
      const propKeys = Object.keys(paths)

      propKeys.forEach((key) => {
        const path = paths[key]
        const fn = this.createStateUpdater(key)
        this.fnMap[path] = fn
        w.track(path, fn)
      })
    }

    componentWillUnmount () {
      const propKeys = Object.keys(paths)

      propKeys.forEach((key) => {
        const path = paths[key]
        const fn = this.fnMap[path]
        w.stopTracking(path, fn)
      })
    }

    createStateUpdater (key) {
      return (value) => {
        this.setState({[key]: value})
      }
    }

    render () {
      return createElement(
        WrappedComponent,
        Object.assign({}, this.state, this.props),
        this.props.children
      )
    }
  }
}

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
