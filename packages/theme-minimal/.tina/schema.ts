import { defineSchema, defineConfig } from 'tinacms'
import type { TinaTemplate } from 'tinacms'

const contentSectionSchema: TinaTemplate = {
  name: 'content',
  label: 'Content',
  fields: [
    {
      type: 'rich-text',
      label: 'Body',
      name: 'body',
    },
  ],
}

export default defineSchema({
  collections: [
    {
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
    },
    {
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
          type: 'reference',
          label: 'Author',
          name: 'author',
          collections: ['author'],
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
          name: '_body',
          templates: [],
          isBody: true,
        },
      ],
    },
    {
      label: 'Authors',
      name: 'author',
      path: 'content/authors',
      fields: [
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Avatar',
          name: 'avatar',
        },
      ],
    },
    {
      label: 'Pages',
      name: 'page',
      path: 'content/pages',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'object',
          list: true,
          name: 'sections',
          label: 'Sections',
          templates: [contentSectionSchema],
        },
      ],
    },
  ],
})

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
    if (formConfig.id === 'getConfigDocument') {
      return createGlobalForm(formConfig)
    }

    return createForm(formConfig)
  },
})
