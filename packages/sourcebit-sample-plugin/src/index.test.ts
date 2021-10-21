import * as plugin from '.'
import type { ContextType } from '.'

describe('bootstrap()', () => {
  test('initial', () => {
    const options = {}

    let context: ContextType = {}

    plugin.bootstrap({
      log: console.log,
      debug: console.debug,
      getPluginContext: () => context,
      setPluginContext: (ctx) => (context = ctx),
      options,
      refresh: () => {},
    })

    expect(context).toHaveProperty('entries')
    expect(context.entries).toHaveLength(41)

    const output = plugin.transform({
      log: console.log,
      debug: console.debug,
      options,
      data: {
        models: [],
        objects: [],
      },
      getPluginContext: () => context,
    })

    const { models, objects } = output

    expect(models).toHaveLength(5)
    expect(objects).toHaveLength(41)
    expect(objects).toHaveLength(41)
  })
})
