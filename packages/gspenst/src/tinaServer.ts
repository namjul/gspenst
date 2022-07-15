import path from 'path'
import EventEmitter, { once } from 'events'
import fse from 'fs-extra'
import spawn from 'cross-spawn'
import { createLogger } from './logger'

const log = createLogger('tinaServer')

export async function startTinaServer(
  this: { projectPath: string } & EventEmitter,
  config: { onlyCheck: boolean }
) {
  if (
    !(await fse.pathExists(
      path.resolve(this.projectPath, '.tina', 'schema.ts')
    ))
  ) {
    throw new Error('Theme is missing schema definition')
  }

  if (!config.onlyCheck) {
    log('Starting tina server', this.projectPath)

    // TODO remove `--noWatch` and add `--experimentalData`
    const ps = spawn('tinacms', ['server:start', '--noWatch'], {
      cwd: this.projectPath,
    })

    this.on('cleanup', () => {
      ps.kill()
    })

    // TODO output errors
    if (ps.stdout) {
      let flag = true
      while (flag) {
        const [data] = (await once(ps.stdout, 'data')) as Buffer[] // eslint-disable-line no-await-in-loop
        const msg = data?.toString().trim()
        if (msg) {
          log(msg)
          // eslint-disable-next-line max-depth
          if (msg.includes('4001')) {
            flag = false
          }
        }
      }
    }

    return ps
  }
}
