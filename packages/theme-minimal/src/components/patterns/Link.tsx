import type { PropsWithChildren } from 'react'
import NextLink from 'next/link'
import type { LinkProps as NextLinkProps } from 'next/link'

const Link = (
  props: PropsWithChildren<
    NextLinkProps & Pick<React.ComponentPropsWithRef<'a'>, 'target'>
  >
) => {
  const { children, ...linkProps } = props
  return (
    <NextLink {...linkProps} passHref>
      <a href="passRef">{children}</a>
    </NextLink>
  )
}

export default Link
