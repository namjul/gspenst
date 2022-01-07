// https://github.com/stackbit/sourcebit-sample-plugin/blob/master/index.js

import type { ISourcebitPlugin, ModelData } from 'sourcebit'
import pkg from '../package.json'
import dataEntries from './data'
import type { Tag, Author, Post, Page, Setting } from './types'

export const name: ISourcebitPlugin['name'] = pkg.name

type Options = {}

type Entry = Tag | Author | Post | Page | Setting

type TagFields = Array<keyof Tag>
type AuthorFields = Array<keyof Author>
type PageFields = Array<keyof Page>
type PostFields = Array<keyof Post>
type SettingFields = Array<keyof Setting>
type Models = ModelData<
  TagFields | AuthorFields | PageFields | PostFields | SettingFields
>[]

export type ContextType = {
  entries?: Entry[]
  models?: Models
}

type SourebitPluginType = ISourcebitPlugin<Options, ContextType>

export const options: Exclude<SourebitPluginType['options'], undefined> = {}

export const bootstrap: Exclude<SourebitPluginType['bootstrap'], undefined> = ({
  // debug,
  getPluginContext,
  log,
  // options,
  // refresh,
  setPluginContext,
}) => {
  const context = getPluginContext()

  if (context.entries) {
    log(`Loaded ${context.entries.length} entries from cache`)
  } else {
    const entries = ([] as Entry[]).concat(
      dataEntries.posts,
      dataEntries.pages,
      dataEntries.authors,
      dataEntries.tags,
      dataEntries.setting
    )

    const models: Models = [
      {
        source: pkg.name,
        modelName: 'tag',
        modelLabel: 'Tags',
        fieldNames: ['id', 'name', 'description', 'slug', 'color'],
        projectId: '',
        projectEnvironment: '',
      },
      {
        source: pkg.name,
        modelName: 'author',
        modelLabel: 'Authors',
        fieldNames: ['id', 'name', 'title', 'description', 'slug', 'thumbnail'],
        projectId: '',
        projectEnvironment: '',
      },
      {
        source: pkg.name,
        modelName: 'page',
        modelLabel: 'Pages',
        fieldNames: ['id', 'title', 'slug', 'body'],
        projectId: '',
        projectEnvironment: '',
      },
      {
        source: pkg.name,
        modelName: 'post',
        modelLabel: 'Posts',
        fieldNames: ['id', 'title', 'slug', 'body'],
        projectId: '',
        projectEnvironment: '',
      },
      {
        source: pkg.name,
        modelName: 'setting',
        modelLabel: 'Settings',
        fieldNames: ['title', 'name', 'description'],
        projectId: '',
        projectEnvironment: '',
      },
    ]

    setPluginContext({
      entries,
      models,
    })
  }
}

export const transform: Exclude<SourebitPluginType['transform'], undefined> = ({
  data,
  getPluginContext,
}) => {
  const { entries, models } = getPluginContext()

  const normalizedEntries = (entries ?? []).map((entry) => {
    const normalizedEntry = {
      source: pkg.name,
      id: entry.id,
      modelName: entry.type,
      modelLabel: `${entry.type.charAt(0).toUpperCase()}${entry.type.slice(
        1
      )}s`,
      projectId: '',
      projectEnvironment: '',
      createdAt:
        'created' in entry ? new Date(entry.created).toISOString() : '',
      updatedAt:
        'updated' in entry ? new Date(entry.updated).toISOString() : '',
    }

    return {
      ...entry,
      __metadata: normalizedEntry,
    }
  })

  return {
    ...data,
    models: data.models.concat(models ?? []),
    objects: data.objects.concat(normalizedEntries),
  }
}
