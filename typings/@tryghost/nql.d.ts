declare module '@tryghost/nql' {
  function tpl(
    filter: string,
    options?: { expansions?: { key: string; replacement: string }[] }
  ): {
    queryJSON: (obj: object) => boolean
    parse: () => object
  }

  export default tpl
}
