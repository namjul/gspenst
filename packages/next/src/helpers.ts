
export const assertUnreachable = (_: never): never => {
  throw new Error('Should not have reached here')
}
