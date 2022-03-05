import dynamic from 'next/dynamic'
import { TinaEditProvider } from 'tinacms/dist/edit-state'

const TinaProvider = dynamic(() => import('./TinaProvider'), { ssr: false })

const DynamicTina = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <TinaEditProvider editMode={<TinaProvider>{children}</TinaProvider>}>
      {children}
    </TinaEditProvider>
  )
}

export default DynamicTina
