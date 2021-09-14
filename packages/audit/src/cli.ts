import fs from 'fs'
import path from 'path'
import http from 'http'
import { spawnSync } from 'child_process'
import clipboardy from 'clipboardy'
import { createHttpTerminator } from 'http-terminator'
import handler from 'serve-handler'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import yargs from 'yargs/yargs'

async function launchChromeAndRunLighthouse(url: string) {
  const chrome = await chromeLauncher.launch()

  const opts = {
    port: chrome.port,
    // throttlingMethod: 'devtools',
  } as const
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

function createLighthouseViewerURL(filePath: string) {
  const string = fs.readFileSync(filePath, 'utf-8')
  const lighthouseViewerObject = { lhr: JSON.parse(string) as {} }
  const base64 = btoa(
    unescape(encodeURIComponent(JSON.stringify(lighthouseViewerObject)))
  )
  clipboardy.writeSync(
    `https://googlechrome.github.io/lighthouse/viewer/#${base64}`
  )
  console.log('Copied Lighthouse Viewer URL to clipboard.')
}

const PORT = 34171

async function snapshot(opts: { staticFolder: string; cmd: string }) {
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

  return launchChromeAndRunLighthouse(url).then(async (result) => {
    await httpTerminator.terminate()
    return result
  })
}

async function createReportFromFolder(folder: string) {
  const dirName = '.audits'

  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName)
  }

  let result

  if (fs.existsSync(path.resolve(folder, 'gatsby-config.js'))) {
    console.log('GatsbyJS site detected')
    result = await snapshot({
      staticFolder: 'public',
      cmd: 'build',
    })
  }

  if (fs.existsSync(path.resolve(folder, 'next.config.js'))) {
    console.log('NextJS site detected')
    result = await snapshot({
      staticFolder: 'out',
      cmd: 'export',
    })
  }

  const { js, json } = result ?? {}

  if (js && typeof json === 'string') {
    const fileName = `${dirName}/${js.fetchTime.replace(/:/g, '_')}.json`
    fs.writeFileSync(fileName, json)
    createLighthouseViewerURL(fileName)
  }
}

yargs(process.argv.slice(2)) // eslint-disable-line @typescript-eslint/no-unused-expressions
  .options({
    url: { type: 'string' },
    view: { type: 'string' },
  })
  .command(
    '$0',
    'the default command',
    () => {},
    (argv) => {
      const defaultArg = argv._[0] || './'
      if (argv.view) {
        const viewPath = path.resolve(argv.view)
        const viewFileState = fs.statSync(viewPath, { throwIfNoEntry: false })
        if (viewFileState?.isFile() && path.extname(viewPath) === '.json') {
          createLighthouseViewerURL(viewPath)
        }
      } else if (typeof defaultArg === 'string') {
        void createReportFromFolder(defaultArg)
      } else if (argv.url) {
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
      } else {
        throw new Error('nothing to do')
      }
    }
  ).argv
