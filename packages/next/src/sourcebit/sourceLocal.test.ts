import path from 'path'
import mock from 'mock-fs'
import * as plugin from './sourceLocal'
import type { ContextType } from './sourceLocal'

beforeEach(() => {
  console.log('') // See https://github.com/tschaub/mock-fs/issues/234#issuecomment-377862172
  mock({
    [`${process.cwd()}/content`]: mock.load(
      path.resolve(__dirname, '__fixtures__/content')
    ),
  })
})

afterEach(() => {
  mock.restore()
})

describe('bootstrap()', () => {
  test('initial', async () => {
    const options = Object.entries(plugin.options).reduce(
      (acc, [key, value]) => {
        return {
          ...acc,
          [key]: value.default, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }
      },
      {}
    )

    let context: ContextType = {}

    await plugin.bootstrap({
      log: () => {},
      debug: () => {},
      getPluginContext: () => context,
      setPluginContext: (ctx) => (context = ctx),
      options,
      refresh: () => {},
    })

    expect(context).toHaveProperty('files')
    expect(context.files).toHaveLength(6)
    expect(context.files?.[0]?.__metadata).toBeTruthy()

    // const output = plugin.transform({
    //   log: console.log,
    //   debug: console.debug,
    //   options,
    //   data: {
    //     models: [],
    //     objects: [],
    //   },
    //   getPluginContext: () => context,
    // })
    //
    // // @ts-expect-error -- ouput will not be a promise
    // const { models, objects } = output
    //
    // expect(models).toHaveLength(5)
    // expect(objects).toHaveLength(41)
    // expect(objects).toHaveLength(41)
  })
})
