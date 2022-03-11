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
      type: null,
      slug: '',
      template: 'Home',
    })
    expect(routingMap).toHaveProperty('features', {
      type: null,
      slug: 'features',
      template: 'Features',
    })
    expect(routingMap).toHaveProperty('about/team', {
      type: null,
      slug: 'about/team',
      template: 'Page',
      data: 'page.about',
    })
    expect(routingMap).toHaveProperty('about', undefined)
  })
  test('routing config with collections', async () => {
    const routingConfig: Routing = {
      collections: {
        '/blog/': {
          permalink: '/blog/{slug}',
          template: 'BlogLayout',
          // filter: 'primary_tag:blog',
        },
        '/podcast/': {
          permalink: '/podcast/{slug}',
          template: 'PodcastLayout',
          // filter: 'primary_tag:podcast',
        },
      },
    }

    const routingMap = await createRoutingMap(routingConfig)

    expect(routingMap).toHaveProperty('blog', {
      slug: 'blog',
      template: 'BlogLayout',
      type: 'index',
    })
    // expect(routingMap).toHaveProperty('blog/first-post', {
    //   slug: 'first-post',
    // })
  })
})
