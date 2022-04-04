export const queryTypes = ['read', 'browse'] as const
export const taxonomies = ['tag', 'author'] as const
export const resourceTypes = ['post', 'page', ...taxonomies] as const
export const queryOptions = [
  'slug',
  'filter',
  'limit',
  'order',
  // 'include',
  // 'visibility',
  // 'status',
  // 'page',
] as const
export const contextTypes = [
  'index',
  'home',
  'paged',
  'post',
  'page',
  'tag',
  'author',
] as const
