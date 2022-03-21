import path from 'path'
import { once } from 'events'
import fse from 'fs-extra'
import spawn from 'cross-spawn'
import debug from 'debug'
import type { GspenstPlugin } from './plugin'

const log = debug('@gspenst/next:tinaServer')

export async function startTinaServer(this: GspenstPlugin) {
  log('Starting tina server', this.packagePath)

  if (
    !(await fse.pathExists(
      path.resolve(this.packagePath, '.tina', 'schema.ts')
    ))
  ) {
    throw new Error('Theme is missing schema definition')
  }

  const ps = spawn('tinacms', ['server:start', '--noWatch'], {
    cwd: this.packagePath,
  })

  this.on('cleanup', () => {
    ps.kill()
  })

  if (ps.stdout) {
    let flag = true
    while (flag) {
      const [data] = (await once(ps.stdout, 'data')) as Buffer[] // eslint-disable-line no-await-in-loop
      const msg = data?.toString().trim()
      if (msg) {
        log(msg)
        if (msg.includes('4001')) {
          flag = false
        }
      }
    }
  }
}
