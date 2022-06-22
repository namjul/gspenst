import { TinaEditProvider } from 'tinacms/dist/edit-state'
import type { TinaCloudSchema } from 'tinacms'
import getComponent from './componentRegistry'

const DynamicTinaProvider = ({
  tinaSchema,
  children,
}: React.PropsWithChildren<{
  tinaSchema: TinaCloudSchema
}>) => {
  const TinaProvider = getComponent('TinaProvider')

  if (!TinaProvider) {
    throw new Error('Missing TinaProvider')
  }
  return (
    <TinaEditProvider
      editMode={<TinaProvider tinaSchema={tinaSchema}>{children}</TinaProvider>}
    >
      {children}
    </TinaEditProvider>
  )
}

export default DynamicTinaProvider
