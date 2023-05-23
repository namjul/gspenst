import { type GspenstThemeLayoutProps } from '@gspenst/next'

export default function Layout({ context, pageMap }: GspenstThemeLayoutProps) {
  return (
    <div>
      <pre>{JSON.stringify({ context, pageMap }, null, 2)}</pre>
    </div>
  )
}
