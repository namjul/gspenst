import { createSchema } from '@gspenst/next'
import type { TinaTemplate } from '@gspenst/next'

const testimonialBlockSchema: TinaTemplate = {
  name: 'BlockQuote',
  label: 'Block Quote',
  fields: [
    {
      name: 'children',
      label: 'Quote',
      type: 'string',
      ui: {
        component: 'textarea',
      },
    },
    {
      name: 'authorName',
      label: 'Author',
      type: 'string',
    },
  ],
}

const ctaBlockSchema: TinaTemplate = {
  name: 'Cta',
  label: 'Call to Action',
  fields: [
    {
      type: 'string',
      name: 'heading',
      label: 'Heading',
    },
  ],
}

export default createSchema([testimonialBlockSchema, ctaBlockSchema])
