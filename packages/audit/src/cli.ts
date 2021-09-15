import fs from 'fs'
import path from 'path'
import http from 'http'
import { spawnSync } from 'child_process'
import clipboardy from 'clipboardy'
import { createHttpTerminator } from 'http-terminator'
import handler from 'serve-handler'
import lighthouse from 'lighthouse'
import type { RunnerResult, Flags } from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import yargs from 'yargs/yargs'
import glob from 'glob'

const PORT = 34171
const THRESHOLD = 2

type LighthouseResult = RunnerResult['lhr']
type AuditResult = LighthouseResult['audits']['x']

async function launchChromeAndRunLighthouse(
  url: string
): Promise<RunnerResult | undefined> {
  const chrome = await chromeLauncher.launch()

  const opts: Flags = {
    port: chrome.port,
    throttlingMethod: 'simulate',
  }
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

function formatChange(from: AuditResult, to: AuditResult, threshold: number) {
  const fromValue = from.numericValue as number
  const toValue = to.numericValue as number

  const fromScore = from.score as number
  const toScore = to.score as number

  const relativeChange = calcRelativeChange(fromValue, toValue)
  const percentage = Math.round(relativeChange * 100) // percent as integer

  let logColor = '\x1b[37m'
  let formattedValue

  const colorCodes = {
    red: '\x1b[91m', // poor,
    orange: '\x1b[33m', // needs improvement
    green: '\x1b[32m', // good
    gray: '\x1b[37m',
  } as const

  const colorCode =
    colorCodes[toScore > 0.89 ? 'green' : toScore > 0.49 ? 'orange' : 'red'] // from https://web.dev/performance-scoring/

  const msDiff = Math.round(toValue - fromValue)
  const scoreDiff = Math.round((toScore - fromScore) * 100)

  const numericUnit = to.numericUnit
  const formattedAbsoluteMs = `${Math.round(toValue)} ${numericUnit}`
  const formattedMs = `${msDiff} ${numericUnit}`

  if (scoreDiff > 0) {
    logColor = '\x1b[32m'
    formattedValue = `increased by ${scoreDiff}, ${percentage}%, ${formattedMs}) `
  } else if (scoreDiff === 0) {
    formattedValue = `unchanged (${percentage}% ${formattedMs}) `
  } else if (scoreDiff < 0) {
    logColor = '\x1b[91m'
    formattedValue = `decreased by ${scoreDiff}, ${percentage}%, ${formattedMs}) `
  }

  if (Math.abs(scoreDiff) < threshold) {
    logColor = '\x1b[37m'
  }
  return `${colorCodes.gray}${from.title}:${colorCode} ${
    toScore * 100
  } (${formattedAbsoluteMs}) ${logColor}${formattedValue}`
}

function compareReports(
  from: LighthouseResult,
  to: LighthouseResult,
  threshold: number
) {
  const metricFilter = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'speed-index',
    'interactive',
    'total-blocking-time',
    'cumulative-layout-shift',
    'server-response-time',
  ]
  for (const auditObj in from.audits) {
    if (metricFilter.includes(auditObj)) {
      const fromResult = from.audits[auditObj]
      const toResult = to.audits[auditObj]
      console.log(formatChange(fromResult, toResult, threshold))
    }
  }
}

async function createReportFromFolder(
  folder: string,
  view: boolean | undefined,
  threshold: number
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
      compareReports(recentReport, result.lhr, threshold)
    }
  }
}

yargs(process.argv.slice(2)) // eslint-disable-line @typescript-eslint/no-unused-expressions
  .options({
    url: { type: 'string' },
    view: { type: 'boolean' },
    threshold: { type: 'number', default: THRESHOLD },
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
        await createReportFromFolder(fullPath, argv.view, argv.threshold)
      } else if (argv.url) {
        const dirName = createDirNameFromUrl(argv.url)

        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName)
        }

        void launchChromeAndRunLighthouse(argv.url).then((result) => {
          const { lhr: js, report: json } = result ?? {}
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
