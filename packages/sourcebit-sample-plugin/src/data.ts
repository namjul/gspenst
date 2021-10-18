/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

import dream from 'dreamjs'
import type { Dict } from '@gspenst/utils'
import type { Tag, Author, Post, Page, Setting } from './types'

// ------------ Tags --------------

dream.schema('Tag', {
  id: 'guid',
  name: 'name',
  description: 'sentence',
  slug: 'word',
  color: 'color',
})

const tags = dream
  .useSchema('Tag')
  .generateRnd(10)
  .output()
  .map((tag: Dict) => ({ ...tag, type: 'tag' })) as Tag[]

// ------------ Authors --------------

dream.schema('Author', {
  id: 'guid',
  name: 'name',
  title: 'sentence',
  description: 'sentence',
  slug: 'word',
  thumbnail: 'avatar',
  // social: [{
  //   name: 'name',
  //   url: 'url'
  // }]
})

const authors = dream
  .useSchema('Author')
  .generateRnd(10)
  .output()
  .map((author: Dict) => ({ ...author, type: 'author' })) as Author[]

// ------------ Posts --------------

const postSchema = {
  id: 'guid',
  title: 'sentence',
  slug: 'word',
  body: 'paragraph',
  created: 'timestamp',
  updated: 'timestamp',
  // tags: []
}

dream.schema('Post', postSchema)

const posts = dream
  .useSchema('Post')
  .generateRnd(10)
  .output()
  .map((post: Dict) => ({ ...post, type: 'post' })) as Post[]

// ------------ Pages --------------

dream.schema('Page', postSchema)

const pages = dream
  .useSchema('Page')
  .generateRnd(10)
  .output()
  .map((page: Dict) => ({ ...page, type: 'page' })) as Page[]

// ------------ Setting --------------

dream.schema('Setting', {
  id: 'guid',
  title: 'sentence',
  name: 'name',
  description: 'sentence',
  // navigation: []
})

const setting = [
  {
    ...dream.useSchema('Setting').generateRnd(1).output(),
    type: 'setting',
  },
] as Setting[]

export default {
  posts,
  pages,
  tags,
  authors,
  setting,
}
