import Head from 'next/head'
import { View } from '@gspenst/components'
import { ThemeSwitch } from '../patterns/ThemeSwitch'
import { EditButton } from '../patterns/EditButton'

export type LayoutProps = React.PropsWithChildren<{}>

const Layout = ({ children }: LayoutProps) => {
  const meta = {
    title: 'Title',
    site_name: 'Site name',
    description: 'description',
    path: 'Path',
    type: 'Type',
    image: 'Image',
    date: 'date',
  }

  const options = {
    head: undefined,
    footer: undefined,
    darkMode: true,
  }

  return (
    <>
      <Head>
        <title>{meta.title || meta.site_name}</title>
        <meta name="description" content={meta.description} />
      </Head>
      <View as="main" css={{ color: '$gray11', backgroundColor: '$gray2' }}>
        {children}
        {options.darkMode && <ThemeSwitch />}
        {options.footer}
        <EditButton />
      </View>
    </>
  )
}

export default Layout
