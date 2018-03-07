const isDate = d => d instanceof Date
const isEmpty = o => Object.keys(o).length === 0
const isObject = o => o != null && typeof o === 'object'
const properObject = o => isObject(o) && !o.hasOwnProperty ? { ...o } : o

function diff (lhs, rhs) {
  // equal return no diff
  if (lhs === rhs) return {}

  // return updated rhs
  if (!isObject(lhs) || !isObject(rhs)) return rhs

  const l = properObject(lhs)
  const r = properObject(rhs)

  const deletedValues = Object.keys(l).reduce((acc, key) => {
    return r.hasOwnProperty(key) ? acc : { ...acc, [key]: undefined }
  }, {})

  if (isDate(l) || isDate(r)) {
    if (l.valueOf() == r.valueOf()) return {}

    return r
  }

  return Object.keys(r).reduce((acc, key) => {
    if (r.hasOwnProperty('__tainted__')) return acc // return no diff
    if (!l.hasOwnProperty(key)) return { ...acc, [key]: r[key] } // return added r key

    Object.defineProperty(r, '__tainted__', {
      enumerable: false,
      writable: false,
      configurable: true,
      value: true
    })

    const difference = diff(l[key], r[key])

    delete r.__tainted__

    if (isObject(difference) && isEmpty(difference) && !isDate(difference)) return acc // return no diff

    return { ...acc, [key]: difference } // return updated key
  }, deletedValues)
}

export { diff }
