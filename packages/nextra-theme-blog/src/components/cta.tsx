import { type Template } from 'gspenst'

export const Cta = ({ heading }: { heading: string }) => {
  return <div>{heading}</div>
}

export const ctaBlockSchema: Template = {
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
