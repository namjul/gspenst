import path from 'path'
import { once } from 'events'
import fse from 'fs-extra'
import spawn from 'cross-spawn'
import debug from 'debug'

const log = debug('@gspenst/next:tinaServer')

export async function startTinaServer(
  packagePath: string,
  callback: () => void
) {
  log('Starting tina server', packagePath)

  if (
    !(await fse.pathExists(path.resolve(packagePath, '.tina', 'schema.ts')))
  ) {
    throw new Error('Theme is missing schema definition')
  }

  const ps = spawn('tinacms', ['server:start', '--noWatch'], {
    cwd: packagePath,
  })

  process.on('exit', () => {
    // cleanup
    callback()
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
