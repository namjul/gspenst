export const taxonomyTypes = ['tag', 'author'] as const
export const resourceTypes = ['post', 'page', ...taxonomyTypes] as const
export const themeContextTypes = [
  null,
  'index',
  'home',
  'paged',
  'post',
  'page',
  'tag',
  'author',
] as const
export const routingContextTypes = [
  'collection',
  'channel',
  'entry',
  'custom',
  'redirect',
  'internal',
] as const
export const dynamicVariables = [
  'slug',
  'year',
  'month',
  'day',
  'primary_tag',
  'primary_author',
] as const
