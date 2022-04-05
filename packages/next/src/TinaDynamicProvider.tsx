import { TinaEditProvider } from 'tinacms/dist/edit-state'
import getComponent from './componentRegistry'

// const TinaProvider = dynamic(() => import('./TinaProvider'), { ssr: false })
const DynamicTinaProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const TinaProvider = getComponent('TinaProvider')

  if (!TinaProvider) {
    throw new Error('Missing TinaProvider')
  }
  return (
    <TinaEditProvider editMode={<TinaProvider>{children}</TinaProvider>}>
      {children}
    </TinaEditProvider>
  )
}

export default DynamicTinaProvider
