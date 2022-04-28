import { defineSchema, defineConfig } from 'tinacms'
import type { TinaCollection, TinaTemplate, TinaField } from 'tinacms'

const commonFields: TinaField[] = [
  {
    type: 'datetime',
    label: 'Posted Date',
    name: 'date',
    required: true,
    ui: {
      dateFormat: 'MMMM DD YYYY',
      timeFormat: 'hh:mm A',
    },
  },
  {
    type: 'string',
    label: 'Slug',
    name: 'slug',
    required: true,
  },
]

export function createSchema(templates: TinaTemplate[] = []) {
  const postFields: TinaField[] = [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      required: true,
    },
    {
      type: 'rich-text',
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
      templates,
      isBody: true,
      required: true,
    },
  ]

  const configCollection: TinaCollection = {
    label: 'Config',
    name: 'config',
    path: 'content/config',
    format: 'json',
    fields: [
      {
        type: 'boolean',
        label: 'Dark Mode',
        name: 'darkMode',
      },
    ],
  }

  const pageCollection: TinaCollection = {
    label: 'Pages',
    name: 'page',
    path: 'content/pages',
    format: 'mdx',
    fields: [...commonFields, ...postFields],
  }

  const postCollection: TinaCollection = {
    label: 'Blog Posts',
    name: 'post',
    path: 'content/posts',
    format: 'mdx',
    fields: [...commonFields, ...postFields],
  }

  const authorCollection: TinaCollection = {
    label: 'Authors',
    name: 'author',
    path: 'content/authors',
    format: 'mdx',
    fields: [
      {
        type: 'string',
        label: 'Name',
        name: 'name',
        required: true,
      },
      ...commonFields,
    ],
  }

  const tagCollection: TinaCollection = {
    label: 'Tags',
    name: 'tag',
    path: 'content/tags',
    format: 'mdx',
    fields: [
      {
        type: 'string',
        label: 'Name',
        name: 'name',
        required: true,
      },
      ...commonFields,
    ],
  }

  return defineSchema({
    collections: [
      configCollection,
      pageCollection,
      postCollection,
      authorCollection,
      tagCollection,
    ],
  })
}

export default createSchema()

const branch = 'main'
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`
export const tinaConfig = defineConfig({
  apiURL,
  cmsCallback: (cms) => {
    cms.flags.set('tina-admin', true)
    return cms
  },
  formifyCallback: ({ formConfig, createForm, createGlobalForm }) => {
    if (formConfig.id === 'content/config/index.json') {
      return createGlobalForm(formConfig)
    }

    return createForm(formConfig)
  },
})
