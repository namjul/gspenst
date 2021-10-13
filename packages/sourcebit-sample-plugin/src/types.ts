export type Tag = {
  type: 'tag'
  id: string
  name: string
  description: string
  slug: string
  color: string
}

export type Author = {
  type: 'author'
  id: string
  name: string
  title: string
  description: string
  slug: string
  thumbnail: string
}

export type Post = {
  type: 'post'
  id: string
  title: string
  slug: string
  body: string
  updated: string
  created: string
  // tags: []
}

export type Page = Exclude<Post, 'type'> & { type: 'page' }

export type Setting = {
  type: 'setting'
  id: string
  title: string
  name: string
  description: string
  // navigation: []
}
