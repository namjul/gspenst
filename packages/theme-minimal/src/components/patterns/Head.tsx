import NextHead from 'next/head'
import type { TransformedDataType } from '../../utils/dataTransformer'
// import { useConfig } from '../../config'

export type HeadProps = {
  page: Exclude<TransformedDataType['page'], undefined>
}

const Head = ({ page }: HeadProps) => {
  // const config = useConfig()

  const meta = {
    title: page.pageTitle || 'Untitled', // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
    // description: 'description',
    // path: 'Path',
    // type: 'Type',
    // image: 'Image',
    // date: 'date',
    // title: 'Tina Docs Example',
    // description: 'Power your docs with Tina + MDX',
    // githubRepositoryURL: 'https://github.com/tinacms/tina-docs-example',
    // socialImage: '/images/social.jpg',
    // navItems: [{ title: 'Docs', url: '/docs/' }],
    // twitterAccount: 'tina_cms',
    // siteUrl: 'https://tina.io',
    // author: 'TinaCMS',
  }

  return (
    <NextHead>
      <title>{meta.title}</title>
      {
        // <meta content={meta.description} name="description" />
        // <link rel="canonical" href={absoluteUrl(meta.path)} />
        // <meta property="og:title" content={meta.title} />
        // <meta property="og:description" content={meta.description} />
        // <meta property="og:url" content={absoluteUrl(meta.path)} />
        // <meta property="og:site_name" content={meta.site_name} />
        // <meta property="og:type" content={meta.type} />
        // <meta property="og:image" content={absoluteUrl(meta.image)} />
        // <meta name="twitter:card" content="summary_large_image" />
        // <meta name="twitter:site" content={meta.twitter} />
        // <meta name="twitter:title" content={meta.title} />
        // <meta name="twitter:description" content={meta.description} />
        // <meta name="twitter:image" content={absoluteUrl(meta.image)} />
        // {meta.date && (
        //   <meta property="article:published_time" content={meta.date} />
        // )}
      }
    </NextHead>
  )
}

export default Head
