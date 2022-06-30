import { collect } from './collect'

jest.mock('./api')
jest.mock('./redis')

describe('collect', () => {
  test('simple', async () => {
    const routesConfig = {
      routes: {
        '/team2/about/': {
          template: 'team',
          controller: 'channel' as const,
          filter: 'primary_tag:-tag-1',
          limit: 3,
          data: {
            query: {
              tags: {
                resourceType: 'tag' as const,
                type: 'browse' as const,
                filter: "date:>'2015-07-20'",
                // filter: "slug:tag-1",
                limit: 5,
              },
            },
            router: {},
          },
        },
      },
      collections: {
        '/': {
          permalink: '/post/:slug/:year/',
          filter: 'primary_tag:tag-1',
          limit: 5,
        },
        '/podcast/': {
          permalink: '/podcast/:slug/',
          filter: 'primary_tag:tag-2',
          limit: 5,
        },
        '/bla/': {
          permalink: '/bla/:slug/',
          filter: 'tags:tag-1',
          limit: 5,
        },
      },
      taxonomies: {
        tag: {
          permalink: '/tag/:slug',
          filter: "tags:'%s'" as const,
          limit: 5,
        },
        author: {
          permalink: '/author/:slug',
          filter: "authors:'%s'" as const,
          limit: 5,
        },
      },
    }
    const collectResult = await collect(routesConfig)
    const resources = collectResult._unsafeUnwrap()
    expect(resources).toHaveLength(18)
    expect(resources.find(({ id }) => id === 1824064168)).toEqual(
      expect.objectContaining({
        id: 1824064168,
        filename: '3th-post',
        filepath: 'content/posts/3th-post.mdx',
        relativePath: '3th-post.mdx',
        path: '/post/3th-post/2021/',
        filters: [
          "tags:'tag-1'",
          "authors:'pedro'",
          'primary_tag:tag-1',
          'tags:tag-1',
        ],
        slug: '3th-post',
        year: 2021,
        month: 3,
        day: 3,
        primary_tag: 'tag-1',
        primary_author: 'pedro',
        resourceType: 'post',
        relationships: [2502649434, 2198476025],
      })
    )
    expect(resources.find(({ id }) => id === 1071642883)).toEqual(
      expect.objectContaining({
        filename: 'tag-2',
        filepath: 'content/tags/tag-2.mdx',
        relativePath: 'tag-2.mdx',
        path: '/tag/tag-2',
        filters: ["date:>'2015-07-20'"],
        id: 1071642883,
        slug: 'tag-2',
        year: 2021,
        month: 7,
        day: 3,
        primary_tag: 'all',
        primary_author: 'all',
        resourceType: 'tag',
      })
    )
  })
})
