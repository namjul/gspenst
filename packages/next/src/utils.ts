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

type ToArray<T> = T extends any[] ? T : T[]

/**
 * Transforms `arg` into an array if it's not already.
 *
 * @example
 * import { toArray } from "reakit-utils";
 *
 * toArray("a"); // ["a"]
 * toArray(["a"]); // ["a"]
 */
export function toArray<T>(arg: T) {
  if (Array.isArray(arg)) {
    return arg as ToArray<T>
  }
  return (typeof arg === 'undefined' ? [] : [arg]) as ToArray<T>
}
