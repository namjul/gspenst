declare module '@tryghost/nql' {
  function tpl(
    filter: string,
    options?: { expansions?: { key: string; replacement: string }[] }
  ): {
    queryJSON: (obj: object) => boolean
  }

  export default tpl
}
