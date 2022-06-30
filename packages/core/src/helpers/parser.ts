import { ok, err, z } from '../shared/kernel'
import type { Result } from '../shared/kernel'
import * as Errors from '../errors'

export type ParseResult<T> = Result<T>

export const parse = <T extends z.ZodTypeAny>(
  schema: T,
  raw: unknown
): ParseResult<z.infer<T>> => {
  const parsed = schema.safeParse(raw)

  if (parsed.success) {
    return ok(parsed.data)
  } else {
    return err(Errors.parse(parsed.error, schema.description))
  }
}
