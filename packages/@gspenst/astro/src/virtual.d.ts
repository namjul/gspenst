declare module 'virtual:gspenst/user-config' {
  const Config: import('./types').GspenstConfig
  export default Config
}
declare module 'virtual:gspenst/project-context' {
  export default { root: string }
}
