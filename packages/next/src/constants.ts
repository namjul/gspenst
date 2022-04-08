export const routingFields = ['routes', 'collections', 'taxonomies'] as const
export const queryTypes = ['read', 'browse'] as const
export const taxonomyTypes = ['tag', 'author'] as const
export const resourceTypes = [
  'config',
  'post',
  'page',
  ...taxonomyTypes,
] as const
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
  null,
  'index',
  'home',
  'paged',
  'post',
  'page',
  'tag',
  'author',
] as const
