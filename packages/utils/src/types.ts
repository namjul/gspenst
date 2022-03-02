/* eslint-disable @typescript-eslint/no-explicit-any */

import { LiteralUnion, AsyncReturnType } from 'type-fest'

export type Dict<T = any> = Record<string, T>

export type Unpacked<T> = T extends Array<infer U> ? U : T

export type { LiteralUnion, AsyncReturnType }
