import { defineSchema } from 'tinacms'
import type { TinaCollection, TinaTemplate, TinaField } from 'tinacms'
import { env } from './domain/env'

const commonFields: TinaField[] = [
  {
    type: 'datetime',
    label: 'Posted Date',
    name: 'date',
    required: true,
    ui: {
      dateFormat: 'YYYY MM DD',
    },
  },
  {
    type: 'string',
    label: 'Slug',
    name: 'slug',
    required: true,
  },
]

export function createSchema(
  templates: TinaTemplate[] = [],
  themeFields: TinaField[] = []
) {
  const postFields: TinaField[] = [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      required: true,
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
        type: 'string',
        label: 'Placeholder',
        name: 'Placeholder',
      },
    ],
    ...(themeFields.length && { fields: themeFields }),
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
    format: 'md',
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
    format: 'md',
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
    config: {
      media: {
        tina: {
          publicFolder:
            process.env.NEXT_PUBLIC_TINA_PUBLIC_DIR ??
            env.NEXT_PUBLIC_TINA_PUBLIC_DIR,
          mediaRoot:
            process.env.NEXT_PUBLIC_TINA_MEDIA_ROOT ??
            env.NEXT_PUBLIC_TINA_MEDIA_ROOT,
        },
      },
    },
    collections: [
      configCollection,
      pageCollection,
      postCollection,
      authorCollection,
      tagCollection,
    ],
  })
}
