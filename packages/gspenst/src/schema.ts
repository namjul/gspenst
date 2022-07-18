import { defineSchema, DateFieldPlugin } from 'tinacms'
import { slugify } from '@tryghost/string'
import type { TinaCollection, TinaTemplate, TinaField } from 'tinacms'
import { env } from './domain/env'

type ValidateMeta = {
  value: string
  initial: string
  modified: boolean
  dirty: boolean
  name: string
  data: { tinaField: TinaField }
}

const dateFormat = 'YYYY MM DD'
const commonFields: TinaField[] = [
  {
    type: 'datetime',
    label: 'Posted Date',
    name: 'date',
    ui: {
      dateFormat,
      validate: (
        value,
        allValues: { [name: string]: string },
        meta: ValidateMeta
      ) => {
        if (!value) {
          if (!meta.initial) {
            allValues[meta.name] = DateFieldPlugin.format(value, 'date', {
              dateFormat,
            })
          }
          if (meta.dirty) {
            return 'Required'
          }
          return true
        }
      },
    },
  },
  // @ts-expect-error --- `validate type does not allow boolean return,`
  {
    type: 'string',
    label: 'Slug',
    name: 'slug',
    ui: {
      validate: (
        value,
        allValues: { [name: string]: string },
        meta: ValidateMeta
      ) => {
        if (!value || (!meta.initial && !meta.modified)) {
          const title = 'title' in allValues ? allValues.title : undefined
          const slug = title ? slugify(title) : undefined
          if (slug) {
            allValues[meta.name] = slug
            return undefined
          }
          if (meta.modified) {
            return 'Required'
          }
          return true
        }
      },
    },
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
