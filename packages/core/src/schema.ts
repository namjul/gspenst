import { defineSchema } from 'tinacms'
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
    collections: [
      configCollection,
      pageCollection,
      postCollection,
      authorCollection,
      tagCollection,
    ],
  })
}
