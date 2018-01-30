const { diff } = require('deep-object-diff')

exports.RecursiveProxy = function RecursiveProxy (emitter, reserved, path = [], target, stages = []) {
  const reservedKeys = Object.keys(reserved)

  const handler = {
    get (target, key) {
      if (reservedKeys.includes(key)) {
        return reserved[key]
      }

      if (
        target[key] !== null &&
        (['object', 'function'].includes(typeof target[key]))
      ) {
        return RecursiveProxy(emitter, reserved, path.concat(key), target[key], stages.concat([target[key]]))
      }

      return target[key]
    },

    set (target, key, value) {
      if (reservedKeys.includes(key)) {
        throw new Error(`Cannot overwrite, delete or mutate the ${reservedKeys} values.`)
      }

      const oldVal = target[key]
      Reflect.set(...arguments)
      const finalKey = path.concat(key)
      let builtPath = ''

      for (let i = 0; i < finalKey.length; i++) {
        const bit = finalKey[i]
        const stage = (i === (finalKey.length - 1)) ? target[key] : stages[i]

        builtPath += (builtPath ? '.' : '') + bit
        emitter.emit(builtPath, stage)
      }

      if (['object', 'function'].includes(typeof value)) {
        const d = diff(oldVal, target[key])
        loopEmit(emitter, builtPath, d)
      }

      return true
    }
  }

  return new Proxy(target, handler)
}

function loopEmit (emitter, path, obj) {
  const keys = Object.keys(obj)

  keys.forEach((key) => {
    const v = obj[key]
    const newPath = path + (path ? '.' : '') + key
    emitter.emit(newPath, v)

    if (['object', 'function'].includes(typeof v)) {
      loopEmit(emitter, newPath, v)
    }
  })
}
