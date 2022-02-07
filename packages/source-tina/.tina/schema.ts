import { defineSchema } from '@tinacms/cli'

export default defineSchema({
  collections: [
    {
      label: 'Blog Posts',
      name: 'posts',
      path: 'content/posts',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Blog Post Body',
          name: 'body',
          isBody: true,
          ui: {
            component: 'textarea',
          },
        },
      ],
    },
  ],
})
