import { TinaEditProvider } from 'tinacms/dist/edit-state'
import { defineConfig } from 'tinacms'
import getComponent from './componentRegistry'

const DynamicTinaProvider = ({
  tinaConfig,
  children,
}: React.PropsWithChildren<{
  tinaConfig: ReturnType<typeof defineConfig>
}>) => {
  const TinaProvider = getComponent('TinaProvider')

  if (!TinaProvider) {
    throw new Error('Missing TinaProvider')
  }
  return (
    <TinaEditProvider
      editMode={<TinaProvider tinaConfig={tinaConfig}>{children}</TinaProvider>}
    >
      {children}
    </TinaEditProvider>
  )
}

export default DynamicTinaProvider
