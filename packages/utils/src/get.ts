import { Get } from 'type-fest'

// from https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
export const get = <BaseType, Path extends string>(
  obj: BaseType,
  path: Path,
  defaultValue: any = undefined // eslint-disable-line @typescript-eslint/no-explicit-any
): Get<BaseType, Path> => {
  const travel = (regexp: RegExp) =>
    path
      .split(regexp)
      .filter(Boolean)
      .reduce(
        (res, key: string) =>
          // @ts-expect-error: Unreachable code error
          res !== null && res !== undefined ? res[key] : res,
        obj
      )

  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)

  return result === undefined || result === obj ? defaultValue : result
}
