import { z } from '../shared/kernel'
import { parse } from '../helpers/parser'
import * as Errors from '../errors'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  NEXT_PUBLIC_TINA_CLIENT_ID: z.string().nullable(),
  NEXT_PUBLIC_TINA_TOKEN: z.string().optional(),
  NEXT_PUBLIC_TINA_PUBLIC_DIR: z.string().default('public'),
  NEXT_PUBLIC_TINA_MEDIA_ROOT: z.string().default('uploads'),
})

type EnvVars = z.infer<typeof envSchema>

const envResult = parse(envSchema, {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_TINA_CLIENT_ID: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  NEXT_PUBLIC_TINA_TOKEN: process.env.NEXT_PUBLIC_TINA_TOKEN,
  NEXT_PUBLIC_TINA_PUBLIC_DIR: process.env.NEXT_PUBLIC_TINA_PUBLIC_DIR,
  NEXT_PUBLIC_TINA_MEDIA_ROOT: process.env.NEXT_PUBLIC_TINA_MEDIA_ROOT,
})

if (envResult.isErr()) {
  console.error(
    '❌ Invalid environment variables:\n',
    Errors.format(envResult.error)
  )
  process.exit(1)
}

export const env = envResult.value

export const parseEnv = <T extends z.ZodRawShape>(
  input: unknown,
  schema: T
) => {
  const actualSchema = envSchema.merge(z.object(schema)).refine(
    (value) => {
      if ('NODE_ENV' in <EnvVars>value) {
        const { NODE_ENV, NEXT_PUBLIC_TINA_CLIENT_ID, NEXT_PUBLIC_TINA_TOKEN } =
          <EnvVars>value
        if (NODE_ENV === 'production') {
          return !!NEXT_PUBLIC_TINA_CLIENT_ID && !!NEXT_PUBLIC_TINA_TOKEN
        }
      }
      return true
    },
    {
      message:
        'production environment requires NEXT_PUBLIC_TINA_CLIENT_ID to be set. See https://tina.io/docs/tina-cloud/connecting-site/',
    }
  )
  return parse(actualSchema, input)
}
