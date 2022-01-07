#!/usr/bin/node

const fs = require('fs')
const dream = require('dreamjs')

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
  .map((tag) => ({ ...tag, type: 'tag' }))

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
  .map((author) => ({ ...author, type: 'author' }))

// ------------ Posts --------------

const postSchema = {
  id: 'guid',
  title: 'sentence',
  slug: 'word',
  body: 'paragraph',
  created: 'timestamp',
  updated: 'timestamp',
  featured: 'boolean',
  // tags: []
}

dream.schema('Post', postSchema)

const posts = dream
  .useSchema('Post')
  .generateRnd(10)
  .output()
  .map((post) => ({ ...post, type: 'post' }))

// ------------ Pages --------------

dream.schema('Page', postSchema)

const pages = dream
  .useSchema('Page')
  .generateRnd(10)
  .output()
  .map((page) => ({ ...page, type: 'page' }))

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
]

const data = {
  posts,
  pages,
  tags,
  authors,
  setting,
}

fs.writeFileSync(`${__dirname}/data.json`, JSON.stringify(data))
