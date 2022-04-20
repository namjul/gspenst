import path from 'path'
import fs from 'fs'

// export * from 'dot-prop'

export const existsSync = (f: string): boolean => {
  try {
    fs.accessSync(f, fs.constants.F_OK)
    return true
  } catch (e: unknown) {
    return false
  }
}

export function findContentDir(dir: string = process.cwd()): string {
  if (existsSync(path.join(dir, 'content'))) return 'content'

  throw new Error(
    "> Couldn't find a `content` directory. Please create one under the project root"
  )
}

export function removeNullish<T extends Record<string, any>>(obj: T) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
    }
  })
  return obj as NonNullable<T>
}

type ToArray<T> = T extends any[] ? T : T[]
export function toArray<T>(arg: T) {
  if (Array.isArray(arg)) {
    return arg as ToArray<T>
  }
  return (typeof arg === 'undefined' ? [] : [arg]) as ToArray<T>
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
