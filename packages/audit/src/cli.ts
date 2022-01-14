import fs from 'fs'
import path from 'path'
import clipboardy from 'clipboardy'
import lighthouse from 'lighthouse'
import type { RunnerResult } from 'lighthouse'
import { computeMedianRun } from 'lighthouse/lighthouse-core/lib/median-run'
import * as chromeLauncher from 'chrome-launcher'
import yargs from 'yargs/yargs'
import glob from 'glob'
import { table } from 'table'

// import desktopConfig from 'lighthouse/lighthouse-core/config/lr-desktop-config'
// import mobileConfig from 'lighthouse/lighthouse-core/config/lr-mobile-config'
// import perfConfig from 'lighthouse/lighthouse-core/config/perf-config'

const _argv = yargs(process.argv.slice(2)) // eslint-disable-line @typescript-eslint/no-unused-expressions
  .options({
    url: { type: 'string', default: 'http://localhost:5000' },
    threshold: { type: 'number', default: 2 },
    // TODO rename from/to
    from: { type: 'string' },
    to: { type: 'string' },
    runs: { type: 'number', default: 5 },
    outDir: { type: 'string' },
    table: { type: 'boolean', default: false },
    headless: { type: 'boolean', default: true },
  }).argv

type Argv = typeof _argv
type LighthouseResult = RunnerResult['lhr']
type AuditResult = LighthouseResult['audits']['x']
type Path = string

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

function createDirNameFromUrl(url: string) {
  const urlObj = new URL(url)
  let _dirName = urlObj.host.replace('www.', '')

  if (urlObj.pathname !== '/') {
    _dirName = `${_dirName}${urlObj.pathname.replace(/\//g, '_')}`
  }
  return _dirName
}

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
      if (fromResult && toResult) {
        data.push(formatChange(fromResult, toResult, threshold))
      }
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
    : path.resolve(dir, `${reportToName(reports[0] as LighthouseResult)}.json`)
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
  const _dirName = argv.outDir ?? createDirNameFromUrl(argv.url)

  workingDir = path.resolve(String(argv._[0] ?? './'))
  dirName = path.resolve(workingDir, _dirName)

  const reportPaths = getReportPaths()
  let fromReport: LighthouseResult | undefined = getReport(reportPaths[1])
  let toReport: LighthouseResult | undefined = getReport(reportPaths[0])

  if (argv.to) {
    workingDir = path.resolve(path.dirname(argv.to), '../')
    dirName = path.resolve(workingDir, _dirName)

    toReport = getReport(argv.to)
    fromReport = argv.from ? getReport(argv.from) : fromReport
  } else {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName)
    }

    const runs = process.argv.includes('--runs') ? argv.runs : 1
    const report: Array<LighthouseResult> = []

    for (let i = 0, len = runs; i < len; i++) {
      log('Creating report..')
      /* eslint-disable no-await-in-loop -- should run in serie */
      const chrome = await launchChrome({ headless: argv.headless })
      const result = await lighthouse(
        argv.url,
        {
          throttlingMethod: 'simulate', // 'devtools'
          port: chrome.port,
        }
        // desktopConfig as {}
        // mobileConfig as {}
        // perfConfig as {}
      )
      await chrome.kill()
      /* eslint-enable */

      if (result) {
        report.push(result.lhr)
      }
    }

    saveReports(report)
    log(`Saving report${report.length && 's'}..`)
    console.log('done')

    const newReportPaths = getReportPaths()

    fromReport = getReport(newReportPaths[1])
    toReport = getReport(newReportPaths[0])
  }

  if (fromReport && toReport) {
    compareReports(fromReport, toReport, argv.threshold, argv.table)
  }
  if (toReport) {
    createLighthouseViewerURL(toReport)
  }
}

void main(_argv)
