import fs from 'fs'
import path from 'path'
import http from 'http'
import { spawnSync } from 'child_process'
import clipboardy from 'clipboardy'
import { createHttpTerminator } from 'http-terminator'
import handler from 'serve-handler'
import lighthouse, { RunnerResult } from 'lighthouse'
// import type { RunnerResult } from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import yargs from 'yargs/yargs'
import glob from 'glob'

const PORT = 34171

type LighthouseResult = RunnerResult['lhr']

async function launchChromeAndRunLighthouse(
  url: string
): Promise<RunnerResult | undefined> {
  const chrome = await chromeLauncher.launch()

  const opts = {
    port: chrome.port,
    throttlingMethod: 'devtools',
  } as const
  const result = await lighthouse(url, opts)

  await chrome.kill()

  return result
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
  const lighthouseViewerObject = { lhr: getFileContent(filePath) }
  const base64 = btoa(
    unescape(encodeURIComponent(JSON.stringify(lighthouseViewerObject)))
  )
  clipboardy.writeSync(
    `https://googlechrome.github.io/lighthouse/viewer/#${base64}`
  )
  console.log('Copied Lighthouse Viewer URL to clipboard.')
}

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

function getFileContent(filePath: string) {
  const output = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(output) as {}
}

function calcRelativeChange(from: number, to: number) {
  return (to - from) / from
}

function formatChange(label: string, relativeChange: number) {
  let logColor = '\x1b[37m'
  let formattedValue

  const percentage = Math.round(relativeChange * 100)

  if (percentage > 0) {
    logColor = '\x1b[31m'
    formattedValue = `${Math.abs(percentage)}% slower`
  } else if (percentage === 0) {
    formattedValue = 'unchanged'
  } else {
    logColor = '\x1b[32m'
    formattedValue = `${Math.abs(percentage)}% faster`
  }
  return `${logColor}${label} is ${formattedValue}`
}

function compareReports(from: LighthouseResult, to: LighthouseResult) {
  const metricFilter = [
    'first-contentful-paint',
    'first-meaningful-paint',
    'speed-index',
    'estimated-input-latency',
    'total-blocking-time',
    'max-potential-fid',
    'time-to-first-byte',
    'first-cpu-idle',
    'interactive',
  ]
  for (const auditObj in from.audits) {
    if (metricFilter.includes(auditObj)) {
      const fromValue = from.audits[auditObj].numericValue
      const toValue = to.audits[auditObj].numericValue
      if (fromValue && toValue) {
        const change = calcRelativeChange(fromValue, toValue)
        console.log(formatChange(auditObj, change))
      }
    }
  }
}

async function createReportFromFolder(
  folder: string,
  view: boolean | undefined
) {
  const dirName = '.audits'

  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName)
  }

  const prevReports = glob.sync(`${dirName}/*.json`, {
    sync: true,
  })

  let result: RunnerResult | undefined,
    recentReport: LighthouseResult | undefined

  if (prevReports.length) {
    const dates: Date[] = []
    prevReports.forEach((report) => {
      dates.push(new Date(path.parse(report).name.replace(/_/g, ':')))
    })

    const max = dates.reduce((a, b) => (a > b ? a : b))
    const recentReportName = max.toISOString()

    recentReport = getFileContent(
      `${dirName}/${recentReportName.replace(/:/g, '_')}.json`
    ) as LighthouseResult
  }

  if (fs.existsSync(path.resolve(folder, 'gatsby-config.js'))) {
    console.log('GatsbyJS site detected')
    result = await snapshot({
      staticFolder: 'public',
      cmd: 'build',
    })
  } else if (fs.existsSync(path.resolve(folder, 'next.config.js'))) {
    console.log('NextJS site detected')
    result = await snapshot({
      staticFolder: 'out',
      cmd: 'export',
    })
  }

  if (result) {
    const fileName = `${dirName}/${result.lhr.fetchTime.replace(
      /:/g,
      '_'
    )}.json`
    // @ts-expect-error -- apperently `report` can be string[] but i would not know currently how that case happens
    fs.writeFileSync(fileName, result.report)
    if (view) {
      createLighthouseViewerURL(fileName)
    }

    if (recentReport) {
      compareReports(result.lhr, recentReport)
    }
  }
}

yargs(process.argv.slice(2)) // eslint-disable-line @typescript-eslint/no-unused-expressions
  .options({
    url: { type: 'string' },
    view: { type: 'boolean' },
  })
  .command(
    '$0',
    'the default command',
    () => {},
    async (argv) => {
      const pathArg = String(argv._[0] || './')

      const fullPath = path.resolve(pathArg)
      const pathStat = fs.statSync(fullPath, { throwIfNoEntry: false })

      if (pathStat?.isFile() && path.extname(fullPath) === '.json') {
        createLighthouseViewerURL(fullPath)
      } else if (pathStat?.isDirectory()) {
        await createReportFromFolder(fullPath, argv.view)
      } else if (argv.url) {
        const dirName = createDirNameFromUrl(argv.url)

        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName)
        }

        void launchChromeAndRunLighthouse(argv.url).then((result) => {
          const { lhr: js, report: json } = result || {}
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
        console.log('Nothing do to')
      }
    }
  ).argv
