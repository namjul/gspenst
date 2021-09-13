import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import yargs from 'yargs/yargs'

const argv = yargs(process.argv.slice(2)).options({
  url: { type: 'string' },
}).argv

const launchChromeAndRunLighthouse = async (url: string) => {
  const chrome = await chromeLauncher.launch()

  const opts = {
    port: chrome.port,
  }
  const result = await lighthouse(url, opts)

  await chrome.kill()

  return result?.report
}

if (argv.url) {
  void launchChromeAndRunLighthouse(argv.url).then((results) => {
    console.log(results)
  })
} else {
  throw new Error("You haven't passed a URL to Lighthouse")
}
