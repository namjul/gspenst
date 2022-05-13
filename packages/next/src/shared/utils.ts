// export * from 'dot-prop'

export function removeNullish<T extends Record<string, any>>(
  obj: T
): { [P in keyof T]?: NonNullable<T[P]> } {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
    }
  })
  return obj
}

export function isObject(arg: unknown): arg is object {
  return typeof arg === 'object' && arg != null
}

export function isString(arg: unknown): arg is string {
  return typeof arg === 'string'
}

export function ensureString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error("Value isn't a string type")
  }
}

export const do_ = <T>(f: () => T): T => f()

export function absurd(_: never): never {
  throw new Error('absurd')
}