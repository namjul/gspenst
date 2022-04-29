import TinaCMS, { defineConfig } from 'tinacms'

const TinaProvider = ({
  tinaConfig,
  children,
}: React.PropsWithChildren<{
  tinaConfig: ReturnType<typeof defineConfig>
}>) => {
  console.log(tinaConfig)
  // @ts-expect-error -- actually I dont' expect an error but could not find the reason for it.
  return <TinaCMS {...tinaConfig}>{children}</TinaCMS>
}

export default TinaProvider
