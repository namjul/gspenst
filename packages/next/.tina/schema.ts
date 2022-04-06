import { defineSchema, defineConfig } from 'tinacms'
import type { TinaCollection, TinaTemplate } from 'tinacms'

export function createSchema(templates: TinaTemplate[] = []) {
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
    fields: [
      {
        type: 'string',
        label: 'Title',
        name: 'title',
      },
      {
        type: 'rich-text',
        label: 'Body',
        name: 'body',
        templates,
        isBody: true,
      },
    ],
  }

  const postCollection: TinaCollection = {
    label: 'Blog Posts',
    name: 'post',
    path: 'content/posts',
    format: 'mdx',
    fields: [
      {
        type: 'string',
        label: 'Title',
        name: 'title',
      },
      {
        type: 'image',
        name: 'heroImg',
        label: 'Hero Image',
      },
      {
        type: 'rich-text',
        label: 'Excerpt',
        name: 'excerpt',
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
        type: 'datetime',
        label: 'Posted Date',
        name: 'date',
        ui: {
          dateFormat: 'MMMM DD YYYY',
          timeFormat: 'hh:mm A',
        },
      },
      {
        type: 'rich-text',
        label: 'Body',
        name: 'body',
        templates,
        isBody: true,
      },
    ],
  }

  const authorCollection: TinaCollection = {
    label: 'Authors',
    name: 'author',
    path: 'content/authors',
    fields: [
      {
        type: 'string',
        label: 'Name',
        name: 'name',
      },
    ],
  }

  const tagCollection: TinaCollection = {
    label: 'Tags',
    name: 'tag',
    path: 'content/tags',
    fields: [
      {
        type: 'string',
        label: 'Name',
        name: 'name',
      },
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
