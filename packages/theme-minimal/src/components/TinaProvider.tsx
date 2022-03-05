import dynamic from 'next/dynamic'
import { tinaConfig } from '../../.tina/schema'

const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const TinaProvider = ({ children }: React.PropsWithChildren<{}>) => {
  // @ts-expect-error -- actually I dont' expect an error but could not find the reason for it.
  return <TinaCMS {...tinaConfig}>{children}</TinaCMS>
}

export default TinaProvider
