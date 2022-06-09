import { Result as NeverThrowResult } from 'neverthrow'
import { normalize as _normalize, denormalize as _denormalize } from 'normalizr'
import * as Errors from '../errors'

export const normalize = NeverThrowResult.fromThrowable(_normalize, (error) =>
  Errors.other(
    '`normalizr#normalize`',
    error instanceof Error ? error : undefined
  )
)

export const denormalize = NeverThrowResult.fromThrowable(
  _denormalize,
  (error) =>
    Errors.other(
      '`normalizr#denormalize`',
      error instanceof Error ? error : undefined
    )
)

// const tagSchema = new schema.Entity('tags')
// const authorSchema = new schema.Entity('authors')
// const postSchema = new schema.Entity('posts', {
//   authors: [authorSchema],
//   tags: [tagSchema],
// })
// const pageSchema = new schema.Entity('pages', {
//   authors: [authorSchema],
//   tags: [tagSchema],
// })
//
// const resourceSchema = {
//   posts: [postSchema],
//   pages: [pageSchema],
//   tags: [tagSchema],
//   authors: [authorSchema],
// }
//
// export default (data: {
//   posts: PostResource[]
//   pages: PageResource[]
//   tags: TagResource[]
//   authors: AuthorResource[]
// }) => {
//   return normalize(data, resourceSchema)
// }
