// https://refactoring.guru/smells/primitive-obsession
// http://ddd.fed.wiki.org/view/welcome-visitors/view/domain-driven-design/view/shared-kernel

type ID = string
type DateTimeString = string

type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** References another document, used as a foreign key */
  Reference: any
  JSON: any
}

type Maybe<T> = T | null
