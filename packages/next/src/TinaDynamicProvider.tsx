import { TinaEditProvider } from 'tinacms/dist/edit-state'
import type { ClientConfig } from './shared/client'
import getComponent from './componentRegistry'

const DynamicTinaProvider = ({
  config,
  children,
}: React.PropsWithChildren<{
  config: ClientConfig
}>) => {
  const TinaProvider = getComponent('TinaProvider')

  if (!TinaProvider) {
    throw new Error('Missing TinaProvider')
  }
  return (
    <TinaEditProvider
      editMode={<TinaProvider config={config}>{children}</TinaProvider>}
    >
      {children}
    </TinaEditProvider>
  )
}

export default DynamicTinaProvider
