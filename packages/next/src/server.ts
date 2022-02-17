import path from 'path'
import { once } from 'events'
import fse from 'fs-extra'
import spawn from 'cross-spawn'
import debug from 'debug'
import type { Options } from './types'

const log = debug('@gspenst/next')

export async function startTinaServer(options?: Options) {
  if (!options?.theme) {
    throw new Error('You missed to provide a theme package')
  }

  const packagePath = path.dirname(
    require.resolve(`${options.theme}/package.json`)
  )
  if (
    !(await fse.pathExists(path.resolve(packagePath, '.tina', 'schema.ts')))
  ) {
    throw new Error('Theme is missing schema definition')
  }
  const dest = path.resolve(packagePath, 'content')
  const src = path.resolve(process.cwd(), 'content')

  await fse.ensureSymlink(src, dest)
  process.on('exit', () => {
    fse.removeSync(dest)
  })

  const ps = spawn('tinacms', ['server:start'], {
    cwd: packagePath,
  })

  if (ps.stdout) {
    let flag = true
    while (flag) {
      const [data] = (await once(ps.stdout, 'data')) as Buffer[] // eslint-disable-line no-await-in-loop
      const msg = data?.toString().trim()
      if (msg) {
        log(msg)
        if (msg.includes('port: 4001')) {
          flag = false
        }
      }
    }
  }
}
