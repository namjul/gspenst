import { createRoutingMap } from './routing'

jest.mock('../../.tina/__generated__/types')

describe('routing', () => {
  it('from empty config', async () => {
    const routingMap = await createRoutingMap()
    // pages
    expect(routingMap).toHaveProperty('home')
    expect(routingMap).toHaveProperty('about')
    // posts
    expect(routingMap).toHaveProperty('first-post')
    expect(routingMap).toHaveProperty('second-post')
    // authors
    expect(routingMap).toHaveProperty('author/napolean')
    expect(routingMap).toHaveProperty('author/pedro')
  })
})
