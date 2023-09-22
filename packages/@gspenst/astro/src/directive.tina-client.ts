import type { ClientDirective } from 'astro'

export default ((load) => {
  try {
    const isEditor =
      window.frameElement && window.frameElement.id === 'tina-iframe'
    if (isEditor) {
      load().then((hydrate) => hydrate())
    }
  } catch (e) {
    console.error(e)
  }
}) as ClientDirective
