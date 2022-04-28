import * as api from '../api'
import { createResource } from './resource'

jest.mock('../api')

describe('resource model', () => {
  test('createResource', async () => {
    const {
      data: { getCollections },
    } = (await api.getResources())._unsafeUnwrap()

    const resourcesEdge = getCollections
      .filter(
        ({ documents }) =>
          !documents.edges?.some(
            (x) => x?.node?.__typename === 'ConfigDocument'
          )
      )
      .flatMap(({ documents }) => documents.edges)

    resourcesEdge.forEach((edge) => {
      // @ts-expect-error --- node can be a config resource
      const result = createResource(edge?.node!) // eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
      expect(result.isOk()).toBe(true)
    })
  })
})
