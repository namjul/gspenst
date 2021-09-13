import fs from 'fs'
import path from 'path'
import http from 'http'
import { spawnSync } from 'child_process'
import { createHttpTerminator } from 'http-terminator'
import handler from 'serve-handler'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import yargs from 'yargs/yargs'

const argv = yargs(process.argv.slice(2)).options({
  url: { type: 'string' },
  path: { type: 'string', default: './' },
}).argv

async function launchChromeAndRunLighthouse(url: string) {
  const chrome = await chromeLauncher.launch()

  const opts = {
    port: chrome.port,
  }
  const result = await lighthouse(url, opts)

  await chrome.kill()

  return {
    js: result?.lhr,
    json: result?.report,
  }
}

function createDirNameFromUrl(url: string) {
  const urlObj = new URL(url)
  let dirName = urlObj.host.replace('www.', '')

  if (urlObj.pathname !== '/') {
    dirName = `${dirName}${urlObj.pathname.replace(/\//g, '_')}`
  }
  return dirName
}

const PORT = 34171

function snapshot(opts: { staticFolder: string; cmd: string }) {
  console.log('building site..')
  spawnSync('npm', ['run', opts.cmd])

  const server = http.createServer((request, response) => {
    // Details here: https://github.com/vercel/serve-handler#options
    return handler(request, response, { public: opts.staticFolder })
  })

  server.listen(PORT)

  const httpTerminator = createHttpTerminator({
    server,
  })

  const url = `http://localhost:${PORT}`
  const dirName = '.audits'

  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName)
  }

  void launchChromeAndRunLighthouse(url).then(async ({ js, json }) => {
    if (js && typeof json === 'string') {
      fs.writeFileSync(
        `${dirName}/${js.fetchTime.replace(/:/g, '_')}.json`,
        json
      )
      await httpTerminator.terminate()
      console.log('DONE')
      process.exit()
    }
  })
}

if (argv.path) {
  if (fs.existsSync(path.resolve(argv.path, 'gatsby-config.js'))) {
    console.log('GatsbyJS site detected')
    snapshot({ staticFolder: 'public', cmd: 'build' })
  } else if (fs.existsSync(path.resolve(argv.path, 'next.config.js'))) {
    console.log('NextJS site detected')
    snapshot({ staticFolder: 'out', cmd: 'export' })
  } else {
    throw new Error('no gatsby or next project found')
  }
}

if (argv.url) {
  const dirName = createDirNameFromUrl(argv.url)

  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName)
  }

  void launchChromeAndRunLighthouse(argv.url).then(({ js, json }) => {
    if (js && typeof json === 'string') {
      fs.writeFile(
        `${dirName}/${js.fetchTime.replace(/:/g, '_')}.json`,
        json,
        (err) => {
          if (err) throw err
        }
      )
    }
  })
}
