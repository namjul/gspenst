import { defineSchema } from '@tinacms/cli'
import type { TinaTemplate } from '@tinacms/cli'

const contentSectionSchema: TinaTemplate = {
  name: 'content',
  label: 'Content',
  ui: {
    defaultItem: {
      body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.',
    },
  },
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
      label: 'Global',
      name: 'global',
      path: 'content/global',
      format: 'json',
      fields: [
        {
          type: 'string',
          label: 'Color',
          name: 'color',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary', value: 'primary' },
          ],
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
