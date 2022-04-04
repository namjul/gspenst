import TinaCMS from 'tinacms'
import { tinaConfig } from '../.tina/schema'

const TinaProvider = ({ children }: React.PropsWithChildren<{}>) => {
  // @ts-expect-error -- actually I dont' expect an error but could not find the reason for it.
  return <TinaCMS {...tinaConfig}>{children}</TinaCMS>
}

export default TinaProvider
