/* eslint-disable @typescript-eslint/no-explicit-any */

export type Dict<T = any> = Record<string, T>

export type Unpacked<T> = T extends Array<infer U> ? U : T
