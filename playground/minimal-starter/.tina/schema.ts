import { createSchema } from 'gspenst'
import type { TinaTemplate, TinaField } from 'gspenst'

const fields: TinaField[] = [
  {
    type: 'boolean' as const,
    label: 'Dark Mode',
    name: 'darkMode',
  },
]

const templates: TinaTemplate[] = []

export default createSchema(templates, fields)