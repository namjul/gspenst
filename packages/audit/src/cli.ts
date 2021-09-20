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

const _argv = yargs(process.argv.slice(2)) // eslint-disable-line @typescript-eslint/no-unused-expressions
  .options({
    // url: { type: 'string' },
    view: { type: 'boolean', default: true },
    threshold: { type: 'number', default: 2 },
    // TODO rename from/to
    from: { type: 'string' },
    to: { type: 'string' },
    runs: { type: 'number', default: 5 },
    outDir: { type: 'string', default: '.audits' },
    table: { type: 'boolean', default: false },
    headless: { type: 'boolean', default: true },
  }).argv

type Argv = typeof _argv
type LighthouseResult = RunnerResult['lhr']
type AuditResult = LighthouseResult['audits']['x']
type Path = string

const PORT = 34171
let workingDir: string, dirName: string

async function launchChrome({ headless }: { headless: boolean }) {
  const chromeFlags = []
  if (headless) {
    chromeFlags.push('--headless')
  }
  return chromeLauncher.launch({
    chromeFlags,
    // logLevel: 'info',
  })
}

async function runLighthouse(
  url: string,
  port: number
): Promise<RunnerResult | undefined> {
  const opts: Flags = {
    port,
    throttlingMethod: 'simulate',
  }
  return lighthouse(url, opts)
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
function log(msg: string) {
  process.stdout.write(msg) // eslint-disable-line @typescript-eslint/no-unsafe-argument
}

function saveReports(reports: LighthouseResult[]) {
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
  const output = fs.readFileSync(`${filePath}`, 'utf8')
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
    .sort((a, b) => {
      const bName = path.parse(b).base.replace('.json', '').replace(/_/g, ':')
      const aName = path.parse(a).base.replace('.json', '').replace(/_/g, ':')
      return Number(new Date(bName)) - Number(new Date(aName))
    })
}

async function main(argv: Argv) {
  let fromReport: LighthouseResult | undefined,
    toReport: LighthouseResult | undefined
  workingDir = path.resolve(String(argv._[0] || './'))

  if (argv.to) {
    workingDir = path.resolve(path.dirname(argv.to), '../')
    dirName = path.resolve(workingDir, argv.outDir)

    const reportPaths = getReportPaths()
    fromReport = argv.from ? getReport(argv.from) : getReport(reportPaths[1]) // get newest report
    toReport = getReport(argv.to)
  } else {
    dirName = path.resolve(workingDir, argv.outDir)

    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName)
    }

    let staticFolder: string | undefined, cmd: string | undefined

    if (fs.existsSync(path.resolve(workingDir, 'gatsby-config.js'))) {
      log('GatsbyJS detected..')
      staticFolder = 'public'
      cmd = 'build'
    } else if (fs.existsSync(path.resolve(workingDir, 'next.config.js'))) {
      log('NextJS detected..')
      staticFolder = 'out'
      cmd = 'export'
    } else {
      console.log('Give me something to do.')
      return process.exit(1)
    }

    if (cmd) {
      log('Building site..')
      spawnSync('npm', ['run', cmd])
    }

    const publicPath = path.resolve(workingDir, staticFolder)
    const server = http.createServer((request, response) => {
      // Details here: https://github.com/vercel/serve-handler#options
      return handler(request, response, {
        public: publicPath,
      })
    })
    server.listen(PORT)

    const httpTerminator = createHttpTerminator({ server })

    const runs = process.argv.includes('--runs') ? argv.runs : 1
    const report: Array<LighthouseResult> = []

    const chrome = await launchChrome({ headless: argv.headless })

    for (let i = 0, len = runs; i < len; i++) {
      log('Creating report..')
      // eslint-disable-next-line no-await-in-loop -- we want to run in serie
      const result = await runLighthouse(
        `http://localhost:${PORT}`,
        chrome.port
      )
      if (result) {
        report.push(result.lhr)
      }
    }

    await chrome.kill()
    await httpTerminator.terminate()

    saveReports(report)
    log(`Saving report${report.length && 's'}..`)
    console.log('done')

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

void main(_argv)
