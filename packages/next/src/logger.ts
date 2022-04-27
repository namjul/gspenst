import debug from 'debug'
import pkg from '../package.json'

const key = `${pkg.name}`

export const createLogger = (name?: string) =>
  debug(`${key}${name ? `:${name}` : ''}`)

export const log = createLogger()
