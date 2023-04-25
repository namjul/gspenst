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
            tags: {
              resourceType: 'tag' as const,
              type: 'browse' as const,
              filter: "date:>'2015-07-20'",
              // filter: "slug:tag-1",
              limit: 5,
            },
          },
        },
      },
      collections: {
        '/': {
          permalink: '/post/{slug}/{year}/',
          filter: 'primary_tag:tag-1',
          limit: 5,
        },
        '/podcast/': {
          permalink: '/podcast/{slug}/',
          filter: 'primary_tag:tag-2',
          limit: 5,
        },
      },
      taxonomies: {
        tag: '/tag/{slug}/',
        author: '/author/{slug}/',
      },
    }
    const collectResult = await collect(routesConfig)
    const resources = collectResult._unsafeUnwrap()
    expect(resources).toHaveLength(19) // with routesResource
    expect(resources.find(({ id }) => id === 1824064168)).toEqual(
      expect.objectContaining({
        id: 1824064168,
        path: 'content/posts/3th-post.mdx',
        type: 'post',
        time: 123,
        metadata: {
          breadcrumbs: ['3th-post'],
          path: '/post/3th-post/2021/',
          relativePath: '3th-post.mdx',
          filters: ["tags:'tag-1'", "authors:'pedro'", 'primary_tag:tag-1'],
          id: 1824064168,
          slug: '3th-post',
          year: 2021,
          month: 3,
          day: 3,
          primary_tag: 'tag-1',
          primary_author: 'pedro',
        },
      })
    )

    expect(resources.find(({ id }) => id === 1071642883)).toEqual(
      expect.objectContaining({
        id: 1071642883,
        path: 'content/tags/tag-2.mdx',
        type: 'tag',
        time: 123,
        metadata: {
          id: 1071642883,
          breadcrumbs: ['tag-2'],
          path: '/tag/tag-2/', // NEXT for some reason the output is `/tag-2` which is wrong
          relativePath: 'tag-2.mdx',
          filters: ["date:>'2015-07-20'"],
          slug: 'tag-2',
          year: 2021,
          month: 7,
          day: 3,
          primary_tag: 'all',
          primary_author: 'all',
        },
      })
    )
  })

  test('unique collections', async () => {
    const routesConfig = {
      collections: {
        '/': {
          permalink: '/post/:slug/',
          limit: 5,
        },
        '/podcast/': {
          permalink: '/podcast/',
          limit: 5,
          filter: 'primary_tag:tag-2',
        },
      },
    }
    const collectResult = await collect(routesConfig)
    expect(collectResult.isErr()).toBe(true)
  })
})
