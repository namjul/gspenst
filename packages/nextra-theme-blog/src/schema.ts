import { type TinaTemplate, createSchema } from 'gspenst'
import { testimonialBlockSchema } from './components/testimonial'
import { ctaBlockSchema } from './components/cta'

import { fields } from './config'

const templates: TinaTemplate[] = [testimonialBlockSchema, ctaBlockSchema]

export const schema = createSchema(templates, fields)
