import { type TinaTemplate } from 'gspenst'

export const Cta = ({ heading }: { heading: string }) => {
  return <div>{heading}</div>
}

export const ctaBlockSchema: TinaTemplate = {
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
