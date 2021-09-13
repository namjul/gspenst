import fs from 'fs'
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

  return {
    js: result?.lhr,
    json: result?.report,
  }
}

if (argv.url) {
  const urlObj = new URL(argv.url)
  let dirName = urlObj.host.replace('www.', '')

  if (urlObj.pathname !== '/') {
    dirName = `${dirName}${urlObj.pathname.replace(/\//g, '_')}`
  }

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
  throw new Error("You haven't passed a URL to Lighthouse")
}
