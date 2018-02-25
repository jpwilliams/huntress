const { diff } = require('deep-object-diff')

exports.RecursiveProxy = function RecursiveProxy (
  emitter,
  reserved,
  path = [],
  target,
  stages = []
) {
  const reservedKeys = Object.keys(reserved)

  const handler = {
    get (target, key) {
      if (reservedKeys.includes(key)) return reserved[key]

      if (
        target[key] !== null &&
        (['object', 'function'].includes(typeof target[key]))
      ) {
        return RecursiveProxy(
          emitter,
          reserved,
          path.concat(key),
          target[key],
          stages.concat([target[key]])
        )
      }

      return target[key]
    },

    set (target, key, value) {
      if (reservedKeys.includes(key)) {
        throw new Error(
          `Cannot overwrite, delete or mutate the ${reservedKeys} values.`
        )
      }

      const oldVal = target[key]
      Reflect.set(...arguments)

      let d, isDifferent

      if (typeof oldVal === 'object') {
        d = diff(oldVal, target[key])

        if (Object.keys(d).length) {
          isDifferent = true
        }
      } else if (oldVal !== value) {
        isDifferent = true
      }

      if (!isDifferent) return true

      const finalKey = path.concat(key)
      const lastIndex = finalKey.length - 1

      const builtPath = finalKey.reduce((builtPath, bit, i) => {
        const stage = (i === lastIndex) ? target[key] : stages[i]
        builtPath += (builtPath ? '.' : '') + bit
        emitter.emit(builtPath, stage)

        return builtPath
      }, '')

      if (value && typeof value === 'object') {
        d = d || diff(oldVal, target[key])
        loopEmit(emitter, builtPath, d)
      }

      return true
    },

    deleteProperty (target, key) {
      if (reservedKeys.includes(key)) {
        throw new Error(
          `Cannot overwrite, delete or mutate the ${reservedKeys} values.`
        )
      }

      const oldVal = target[key]
      Reflect.deleteProperty(...arguments)

      const finalKey = path.concat(key)
      const lastIndex = finalKey.length - 1

      const builtPath = finalKey.reduce((builtPath, bit, i) => {
        const stage = (i === lastIndex) ? target[key] : stages[i]
        builtPath += (builtPath ? '.' : '') + bit
        emitter.emit(builtPath, stage)

        return builtPath
      }, '')

      if (oldVal && typeof oldVal === 'object') {
        loopEmit(emitter, builtPath, oldVal, true)
      }

      return true
    }
  }

  return new Proxy(target, handler)
}

function loopEmit (emitter, path, obj, isRemoval) {
  const keys = Object.keys(obj)

  keys.forEach((key) => {
    const v = obj[key]
    const newPath = path + (path ? '.' : '') + key
    emitter.emit(newPath, isRemoval ? undefined : v)

    if (v && typeof v === 'object') {
      loopEmit(emitter, newPath, v, isRemoval)
    }
  })
}
