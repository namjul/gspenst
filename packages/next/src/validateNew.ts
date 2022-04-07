/* eslint-disable new-cap */
import {
  Dictionary,
  Static,
  // Boolean,
  // Number,
  String,
  Unknown,
  Optional,
  Literal,
  // Array,
  Null,
  // Tuple,
  Record,
  // Union,
  // Template,
  // match,
} from 'runtypes'
import { resourceTypes } from './constants'

const Permalink = String.withConstraint((value) => /\/:\w+/.test(value))

const Path = String

const Data = String.withConstraint(
  (value) =>
    new RegExp(`(${resourceTypes.join('|')})\\..*`).test(value) ||
    `${value} has incorrect Format. Please use e.g. tag.recipes`
)
const Properties = Record({
  template: String,
  permalink: Permalink,
  data: Data,
  filter: String,
  order: String,
  limit: String,
  controller: Optional(Literal('channel')),
})
type Properties = Static<typeof Properties>

// const Route = Union(Data, Properties.pick('template', 'data', 'controller'))
// type Route = Static<typeof Route>

// const Collection = Properties.omit('controller')
// type Collection = Static<typeof Collection>

const Routing = Record({
  routes: Optional(Dictionary(Unknown, Path).Or(Null)),
  collections: Optional(Dictionary(Unknown, Path).Or(Null)),
  taxonomies: Optional(
    Record({
      tag: Properties.pick('permalink'),
      author: Properties.pick('permalink'),
    }).Or(Null)
  ),
})
type Routing = Static<typeof Routing>

// function transformData(value: any) {
//   return value
// }
//
// function transformRoute(route: Route) {
// }

export function validate(routingConfig = {}) {
  const routing = Routing.check(routingConfig)

  const unknownProperty = Object.keys(routing).find(
    (key) => !['routes', 'collections', 'taxonomies'].includes(key)
  )
  if (unknownProperty) {
    throw new Error(`${unknownProperty} is not part of routing config.`)
  }

  const unknownTaxonomiesProperty = Object.keys(routing.taxonomies ?? {}).find(
    (key) => !['tag', 'author'].includes(key)
  )
  if (unknownTaxonomiesProperty) {
    throw new Error(
      `${unknownProperty} is not part of taxonomies routing config.`
    )
  }

  // if ('routes' in routing) {
  //   const x = Object.entries(routing.routes)
  //   const y = x.reduce((acc, [path, obj]) => {
  //     return {
  //       ...acc,
  //       [path]: transformRoute(route),
  //     }
  //   }, {} as { [path: string]: ReturnType<typeof transformRoute> })
  // }
}
