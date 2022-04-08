declare module '@tryghost/tpl' {
  function tpl(
    template: string,
    data: unknown[] | Record<string, any>,
    options?: Options
  ): string

  export default tpl
}
