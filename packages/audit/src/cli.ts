import fs from 'fs'
import path from 'path'
import http from 'http'
import { spawnSync } from 'child_process'
import clipboardy from 'clipboardy'
import { createHttpTerminator } from 'http-terminator'
import handler from 'serve-handler'
import lighthouse from 'lighthouse'
import type { RunnerResult, Flags } from 'lighthouse'
import { computeMedianRun } from 'lighthouse/lighthouse-core/lib/median-run'
import * as chromeLauncher from 'chrome-launcher'
import yargs from 'yargs/yargs'
import glob from 'glob'
import { table } from 'table'

type LighthouseResult = RunnerResult['lhr']
type AuditResult = LighthouseResult['audits']['x']
type Path = string

let workingDir: string, dirName: string
let portCount = 34171

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

// function createDirNameFromUrl(url: string) {
//   const urlObj = new URL(url)
//   let dirName = urlObj.host.replace('www.', '')
//
//   if (urlObj.pathname !== '/') {
//     dirName = `${dirName}${urlObj.pathname.replace(/\//g, '_')}`
//   }
//   return dirName
// }

function createLighthouseViewerURL(report: LighthouseResult) {
  const lighthouseViewerObject = { lhr: report }
  const toBase64 = (value: string) => Buffer.from(value).toString('base64')

  const base64 = toBase64(
    unescape(encodeURIComponent(JSON.stringify(lighthouseViewerObject)))
  )
  clipboardy.writeSync(
    `https://googlechrome.github.io/lighthouse/viewer/#${base64}`
  )
  console.log("Report's Lighthouse Viewer URL copied to clipboard.")
}

async function snapshot(opts: {
  staticFolder: Path
  cmd?: string
  type: string
}) {
  if (opts.cmd) {
    console.log(`Building ${opts.type} site..`)
    spawnSync('npm', ['run', opts.cmd])
  }

  const server = http.createServer((request, response) => {
    // Details here: https://github.com/vercel/serve-handler#options
    return handler(request, response, { public: opts.staticFolder })
  })

  const port = portCount++

  server.listen(port)

  const httpTerminator = createHttpTerminator({
    server,
  })

  const url = `http://localhost:${port}`
  const result = await launchChromeAndRunLighthouse(url)

  await httpTerminator.terminate()

  return result
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

  const colorCodes = {
    red: '\x1b[91m', // poor,
    orange: '\x1b[33m', // needs improvement
    green: '\x1b[32m', // good
    gray: '\x1b[37m',
    reset: '\x1b[97m',
  } as const

  let logColor: string = colorCodes.reset
  let formatted

  const colorCode =
    colorCodes[toScore > 0.89 ? 'green' : toScore > 0.49 ? 'orange' : 'red'] // from https://web.dev/performance-scoring/

  const msDiff = Math.round(toValue - fromValue)
  const scoreDiff = Math.round((toScore - fromScore) * 100)

  const { abs } = Math
  const numericUnit = to.numericUnit
  const formattedValue = `${Math.round(toValue)} ${numericUnit}`
  const formattedDiffValue = `${abs(msDiff)} ${numericUnit}`

  if (scoreDiff > 0) {
    logColor = '\x1b[32m'
    formatted = `increased by ${abs(scoreDiff)}, ${abs(
      percentage
    )}%, ${formattedDiffValue}) `
  } else if (scoreDiff === 0) {
    formatted = `unchanged (${abs(percentage)}% ${formattedDiffValue}) `
  } else if (scoreDiff < 0) {
    logColor = '\x1b[91m'
    formatted = `decreased by ${abs(scoreDiff)}, ${abs(
      percentage
    )}%, ${formattedDiffValue}) `
  }

  if (abs(scoreDiff) < threshold) {
    logColor = '\x1b[37m'
  }
  return [
    `${colorCodes.reset}${from.title}${colorCodes.reset}`, // title
    `${colorCode}${toScore * 100} (${formattedValue})${colorCodes.reset}`, // score
    `${logColor}${formatted} ${colorCodes.reset}`, // values
  ]
  // return `${colorCodes.reset}${from.title}:${colorCode} ${
  //   toScore * 100
  // } (${formattedValue}) ${logColor}${formatted} ${colorCodes.reset}`
}

function compareReports(
  from: LighthouseResult,
  to: LighthouseResult,
  threshold: number,
  tableView: boolean
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
  const data = []
  for (const auditObj in from.audits) {
    if (metricFilter.includes(auditObj)) {
      const fromResult = from.audits[auditObj]
      const toResult = to.audits[auditObj]
      data.push(formatChange(fromResult, toResult, threshold))
    }
  }
  if (tableView) {
    console.log(table(data))
  } else {
    data.forEach((row) => console.log(row.join(' ')))
  }
  console.log('\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log(...args: any[]) {
  console.log(...args) // eslint-disable-line @typescript-eslint/no-unsafe-argument
}

function saveReports(reports: LighthouseResult[]) {
  log(`Saving report${reports.length && 's'}..`)
  const reportToName = ({ fetchTime }: LighthouseResult) =>
    fetchTime.replace(/:/g, '_')

  const latestReport = reports.reduce((last, current) => {
    return new Date(last.fetchTime) > new Date(current.fetchTime)
      ? current
      : last
  })

  const dir =
    reports.length > 1
      ? path.resolve(dirName, reportToName(latestReport))
      : dirName

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  reports.forEach((report) => {
    fs.writeFileSync(
      path.resolve(dir, `${reportToName(report)}.json`),
      JSON.stringify(report, null, 2)
    )
  })

  return reports.length > 1
    ? dir
    : path.resolve(dir, `${reportToName(reports[0])}.json`)
}

const getContent = (filePath: Path): LighthouseResult => {
  const output = fs.readFileSync(`${filePath}.json`, 'utf8')
  return JSON.parse(output)
}

function getReport(filePath: Path | undefined) {
  if (!filePath) {
    return undefined
  }

  const filePathStat = fs.statSync(filePath, { throwIfNoEntry: false })

  let report: LighthouseResult

  if (filePathStat?.isDirectory()) {
    const reports = glob
      .sync(`${filePath}/*.json`, {
        sync: true,
      })
      .map(getContent)
    report = computeMedianRun(reports)
  } else {
    report = getContent(filePath)
  }

  return report
}

function getReportPaths() {
  return glob
    .sync(`${dirName}/*`, {
      sync: true,
    })
    .map((reportPath) => {
      return new Date(path.parse(reportPath).name.replace(/_/g, ':'))
    })
    .sort((a, b) => {
      return Number(b) - Number(a)
    })
    .map((date) => {
      return `${dirName}/${date.toISOString().replace(/:/g, '_')}`
    })
}

yargs(process.argv.slice(2)) // eslint-disable-line @typescript-eslint/no-unused-expressions
  .command(
    '$0',
    'path to project or report',
    {
      // url: { type: 'string' },
      view: { type: 'boolean', default: true },
      threshold: { type: 'number', default: 2 },
      // TODO rename from/to
      from: { type: 'string' },
      to: { type: 'string' },
      runs: { type: 'number', default: 5 },
      outDir: { type: 'string', default: '.audits' },
      table: { type: 'boolean', default: false },
    },
    async (argv) => {
      workingDir = path.resolve(String(argv._[0] || './'))

      // set global dirName
      dirName = path.resolve(workingDir, argv.outDir)

      let fromReport: LighthouseResult | undefined,
        toReport: LighthouseResult | undefined

      if (argv.to) {
        fromReport = argv.from
          ? getReport(argv.from)
          : getReport(getReportPaths()[0]) // get newest report
        toReport = getReport(argv.to)
      } else {
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName)
        }

        const runs = process.argv.includes('--runs') ? argv.runs : 1

        const report: Array<LighthouseResult> = []
        for (let i = 0, len = runs; i < len; i++) {
          let opts

          if (fs.existsSync(path.resolve(workingDir, 'gatsby-config.js'))) {
            opts = {
              type: 'GatsbyJS',
              staticFolder: 'public',
              cmd: i === 0 ? 'build' : undefined, // only build site in the first run
            }
          } else if (
            fs.existsSync(path.resolve(workingDir, 'next.config.js'))
          ) {
            opts = {
              type: 'NextJS',
              staticFolder: 'out',
              cmd: i === 0 ? 'export' : undefined, // only build site in the first run
            }
          }

          if (opts) {
            log('Creating report..')
            const result = await snapshot(opts) // eslint-disable-line no-await-in-loop -- we want to run in serie
            if (result) {
              report.push(result.lhr)
            }
          }
        }

        saveReports(report)
        const reportPaths = getReportPaths()
        fromReport = getReport(reportPaths[1])
        toReport = getReport(reportPaths[0])
      }

      if (fromReport && toReport) {
        compareReports(fromReport, toReport, argv.threshold, argv.table)
      }

      if (argv.view && toReport) {
        createLighthouseViewerURL(toReport)
      }
    }
  ).argv
