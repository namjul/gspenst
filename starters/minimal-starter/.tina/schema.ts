import { createSchema } from 'gspenst'
import type { TinaTemplate, TinaField } from 'gspenst'

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

const fields: TinaField[] = [
  {
    type: 'boolean',
    label: 'Dark Mode',
    name: 'darkMode',
  },
]

const templates: TinaTemplate[] = [testimonialBlockSchema, ctaBlockSchema]

export default createSchema(templates, fields)
