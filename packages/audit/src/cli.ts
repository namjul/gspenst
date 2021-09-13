/* eslint-disable @typescript-eslint/no-explicit-any  */

import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const launchChrome = async (url: string) => {
  const chrome = await chromeLauncher.launch()

  const opts = {
    port: chrome.port,
  }
  const { report } = await lighthouse(url, opts)

  await chrome.kill()
  console.log(report)

  return report
}

void launchChrome('http://localhost:5000').then((result) => {
  console.log(result)
})
