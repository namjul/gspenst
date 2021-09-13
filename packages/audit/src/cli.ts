// import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const launchChrome = async (url: string) => {
  const chrome = await chromeLauncher.launch({
    startingUrl: url,
  })

  setTimeout(() => chrome.kill(), 3000)
}

void launchChrome('http://localhost:5000')
