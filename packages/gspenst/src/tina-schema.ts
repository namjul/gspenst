import {
  defineSchema as _defineSchema,
  /*DateFieldPlugin, */
  type Collection,
  type Template,
  type TinaField,
  type Schema,
} from 'tinacms'
// eslint-disable-next-line import/no-extraneous-dependencies
import pageMap from 'gspenst/pageMap.json'
import { createLogger } from './logger'
import { getRoutingMapping, type PageMapItem } from './helpers/getPageMap'

const log = createLogger('tinaschema')

log('BUILDING with the following pageMap', pageMap)

const routingMapping = getRoutingMapping(pageMap as PageMapItem[])

// import slugify from 'slugify'

// type ValidateMeta = {
//   value: string
//   initial: string
//   modified: boolean
//   dirty: boolean
//   name: string
//   data: { tinaField: SchemaField }
// }

// TODO use https://tina.io/docs/contextual-editing/router/
//

const dateFormat = 'YYYY MM DD'
const commonFields: TinaField[] = [
  {
    type: 'datetime',
    label: 'Posted Date',
    name: 'date',
    ui: {
      dateFormat,
      // validate: (
      //   value,
      //   allValues: { [name: string]: string },
      //   meta: ValidateMeta
      // ) => {
      //   if (!value) {
      //     if (!meta.initial) {
      //       console.log('allValues', allValues)
      //       // TODO zod domainSchemas for validation
      //       allValues[meta.name] = DateFieldPlugin.format(value, 'date', {
      //         dateFormat,
      //       })
      //     }
      //     if (meta.dirty) {
      //       return 'Required'
      //     }
      //     return true
      //   }
      // },
    },
  },
  {
    type: 'string',
    label: 'Slug',
    name: 'slug',
    ui: {
      // validate: (
      //   value,
      //   allValues: { [name: string]: string },
      //   meta: ValidateMeta
      // ) => {
      //   if (!value || (!meta.initial && !meta.modified)) {
      //     const filename =
      //       'filename' in allValues ? allValues.filename : undefined
      //     const title = 'title' in allValues ? allValues.title : undefined
      //     const name = 'name' in allValues ? allValues.name : undefined
      //     // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      //     const soonToBeSlug = name || title || filename
      //     // const relativePath = 'name' in allValues ? allValues.name : undefined
      //     const slug = soonToBeSlug ? slugify(soonToBeSlug) : undefined
      //     if (slug) {
      //       allValues[meta.name] = slug
      //       return undefined
      //     }
      //     if (meta.dirty) {
      //       return 'Required'
      //     }
      //     return true
      //   }
      // },
    },
  },
]

export function defineSchema(): Schema {
  const templates: Template[] = []
  const themeFields: TinaField[] = []
  const postFields: TinaField[] = [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
    },
    {
      type: 'string',
      ui: {
        component: 'textarea',
      },
      label: 'Excerpt',
      name: 'excerpt',
      templates,
    },
    {
      label: 'Authors',
      name: 'authors',
      type: 'object',
      list: true,
      fields: [
        {
          label: 'Author',
          name: 'author',
          type: 'reference',
          collections: ['author'],
        },
      ],
    },
    {
      label: 'Tags',
      name: 'tags',
      type: 'object',
      list: true,
      fields: [
        {
          label: 'Tag',
          name: 'tag',
          type: 'reference',
          collections: ['tag'],
        },
      ],
    },
    {
      type: 'rich-text',
      label: 'Content',
      name: 'content',
      templates: [
        {
          name: 'unstable_InternalLink',
          label: 'Internal Link(unstable)',
          inline: true,
          fields: [
            {
              name: 'text',
              label: 'Text',
              type: 'string',
            },
            {
              name: 'document',
              label: 'Document',
              type: 'reference',
              collections: ['post'],
            },
          ],
        },
        ...templates,
      ],
      isBody: true,
    },
  ]

  const configCollection: Collection = {
    label: 'Config',
    name: 'config',
    path: 'content/config',
    format: 'json',
    fields: [
      {
        type: 'string',
        label: 'Placeholder',
        name: 'Placeholder',
      },
    ],
    ui: {
      global: true,
    },
    ...(themeFields.length && { fields: themeFields }),
  }

  const pageCollection: Collection = {
    label: 'Pages',
    name: 'page',
    path: 'content/pages',
    format: 'mdx',
    fields: [...commonFields, ...postFields],
    ui: {
      router: ({ document }) => {
        return (routingMapping)[document._sys.path]
      },
    },
  }

  const postCollection: Collection = {
    label: 'Posts',
    name: 'post',
    path: 'content/posts',
    format: 'mdx',
    fields: [...commonFields, ...postFields],
    ui: {
      router: ({ document }) => {
        return (routingMapping)[document._sys.path]
      },
    },
  }

  const taxonomyFields = (_type: 'author' | 'tag'): TinaField[] => [
    {
      type: 'string',
      label: 'Name',
      name: 'name',
      ui: {
        // validate: (
        //   value,
        //   _allValues: { [name: string]: string },
        //   meta: ValidateMeta
        // ) => {
        //   if (!value) {
        //     if (meta.dirty) {
        //       return `You must specify a name for the ${type}.`
        //     }
        //     return true
        //   }
        // },
      },
    },
  ]

  const authorCollection: Collection = {
    label: 'Authors',
    name: 'author',
    path: 'content/authors',
    format: 'md',
    fields: [...taxonomyFields('author'), ...commonFields],
    ui: {
      router: ({ document }) => {
        return (routingMapping)[document._sys.path]
      },
    },
  }

  const tagCollection: Collection = {
    label: 'Tags',
    name: 'tag',
    path: 'content/tags',
    format: 'md',
    fields: [...taxonomyFields('tag'), ...commonFields],
    ui: {
      router: ({ document }) => {
        return (routingMapping)[document._sys.path]
      },
    },
  }

  return _defineSchema({
    collections: [
      configCollection,
      pageCollection,
      postCollection,
      authorCollection,
      tagCollection,
    ],
  })
}
