import { type Entries } from './kernel'

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

export function isNumber(arg: unknown): arg is number {
  return typeof arg === 'number'
}

export function ensureString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error("Value isn't a string type")
  }
}

export function convertArrayToObject<T extends Record<string, any>>(
  array: T[],
  key: string
) {
  return array.reduce<Record<string, T>>((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    }
  }, {})
}

export function objectMatch<
  T extends Record<string, any>,
  TT extends Record<string, any>
>(match: T, target: TT): boolean {
  const entries = Object.entries(match) as Entries<T>
  return entries
    .map(([key, value]) => {
      if (isObject(value)) {
        return objectMatch(value, target[key])
      }
      return String(target[key]) === String(value) // when i need to compare array convert this to deep-equal
    })
    .every(Boolean)
}
