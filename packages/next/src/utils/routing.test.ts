import type { Routing } from '../types'
import { createRoutingMap } from './routing'

jest.mock('../../.tina/__generated__/types')

describe('routing mapping', () => {
  test('empty routing config', async () => {
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
  test('routing config with routes', async () => {
    const routingConfig: Routing = {
      routes: {
        '/': 'Home',
        '/features/': 'Features',
        '/about/team/': {
          template: 'Page',
          data: 'page.about',
        },
      },
    }
    const routingMap = await createRoutingMap(routingConfig)

    expect(routingMap).toHaveProperty('', {
      slug: '',
      template: 'Home',
    })
    expect(routingMap).toHaveProperty('features', {
      slug: 'features',
      template: 'Features',
    })
    expect(routingMap).toHaveProperty('about/team', {
      slug: 'about/team',
      template: 'Page',
      data: 'page.about',
    })
    expect(routingMap).toHaveProperty('about', undefined)
  })
})
