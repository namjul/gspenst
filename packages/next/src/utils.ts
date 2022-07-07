import path from 'path'
import fs from 'fs'
import type { Resource, LocatorResource } from 'gspenst'

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

export const filterLocatorResources = (
  resource: Resource
): resource is LocatorResource => resource.type !== 'config'
