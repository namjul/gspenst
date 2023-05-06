import EventEmitter, { once } from 'events'
import { createLogger } from './logger'
import { startSubprocess } from './utils'

const log = createLogger('tinaServer')

export async function startTinaServer(
  this: { projectPath: string } & EventEmitter,
  config: { onlyCheck: boolean }
) {
  if (!config.onlyCheck) {
    log('Starting tina server', this.projectPath)

    const ps = await startSubprocess({
      command: 'tinacms dev',
      cwd: this.projectPath,
    })

    this.on('cleanup', () => {
      ps?.kill()
    })

    // TODO output errors
    if (ps?.stdout) {
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
