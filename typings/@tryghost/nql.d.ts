declare module '@tryghost/nql' {
  function tpl(filter: string): {
    queryJSON: (obj: object) => boolean
  }

  export default tpl
}
