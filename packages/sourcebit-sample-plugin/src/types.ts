export type Tag = {
  type: 'tag'
  id: UniqueId
  name: string
  description: string
  slug: string
  color: string
}

export type Author = {
  type: 'author'
  id: UniqueId
  name: string
  title: string
  description: string
  slug: string
  thumbnail: string
}

export type Post = {
  type: 'post'
  id: UniqueId
  title: string
  slug: string
  body: string
  updated: DateTimeString
  created: DateTimeString
  // tags: []
}

export type Page = Omit<Post, 'type'> & { type: 'page' }

export type Setting = {
  type: 'setting'
  id: UniqueId
  title: string
  name: string
  description: string
  // navigation: []
}
