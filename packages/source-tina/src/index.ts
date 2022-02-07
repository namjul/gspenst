import path from 'path'
import fse from 'fs-extra'
import type { ISourcebitPlugin } from 'sourcebit'
import spawn from 'cross-spawn'
import pkg from '../package.json'

export type ContextType = {}

export type Options = {
  verbose?: { name: string; path: string; label: string }[]
}

type SourebitPluginType = ISourcebitPlugin<Options, ContextType>

export const name: SourebitPluginType['name'] = pkg.name

export const options: Exclude<SourebitPluginType['options'], undefined> = {}

export const bootstrap: Exclude<
  SourebitPluginType['bootstrap'],
  undefined
> = async ({
  debug,
  // getPluginContext,
  // log,
  // options,
  // refresh,
  // setPluginContext,
}) => {
  // const context = getPluginContext()

  const packagePath = path.dirname(
    require.resolve('@gspenst/source-tina/package.json')
  )
  const dest = path.resolve(packagePath, 'content')
  const src = path.resolve(process.cwd(), 'content')
  await fse.ensureSymlink(src, dest)
  process.on('exit', () => {
    fse.removeSync(dest)
  })

  const ps = spawn('tinacms', ['server:start', '--noSDK', '--noWatch'], {
    cwd: packagePath,
  })
  ps.stdout?.on('data', (data: Buffer) => {
    const msg = data.toString().trim()
    if (msg) {
      debug(msg)
    }
  })
}

export const transform: Exclude<SourebitPluginType['transform'], undefined> = ({
  data,
  // getPluginContext,
}) => {
  // const {} = getPluginContext()

  return {
    ...data,
  }
}
