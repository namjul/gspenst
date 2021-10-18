// https://github.com/stackbit/sourcebit-sample-plugin/blob/master/index.js

import type { ISourcebitPlugin, ModelData } from 'sourcebit'
import pkg from '../package.json'
import dataEntries from './data'
import type { Tag, Author, Post, Page, Setting } from './types'

export const name: ISourcebitPlugin['name'] = pkg.name

type Options = {}

type Entry = Tag | Author | Post | Page | Setting

export type ContextType = {
  entries?: Entry[]
  models?: ModelData[]
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
      dataEntries.settings
    )

    const models = [
      {
        id: 1,
        source: pkg.name,
        modelName: 'tag',
        modelLabel: 'Tags',
        fieldNames: [
          'id',
          'name',
          'description',
          'slug',
          'color',
        ] as (keyof Tag)[],
        projectId: '',
        projectEnvironment: '',
      },
      {
        id: 2,
        source: pkg.name,
        modelName: 'author',
        modelLabel: 'Authors',
        fieldNames: [
          'id',
          'name',
          'title',
          'description',
          'slug',
          'thumbnail',
        ] as (keyof Author)[],
        projectId: '',
        projectEnvironment: '',
      },
      {
        id: 3,
        source: pkg.name,
        modelName: 'page',
        modelLabel: 'Pages',
        fieldNames: ['id', 'title', 'slug', 'body'] as (keyof Post)[],
        projectId: '',
        projectEnvironment: '',
      },
      {
        id: 4,
        source: pkg.name,
        modelName: 'post',
        modelLabel: 'Posts',
        fieldNames: ['id', 'title', 'slug', 'body'] as (keyof Post)[],
        projectId: '',
        projectEnvironment: '',
      },
      {
        id: 5,
        source: pkg.name,
        modelName: 'setting',
        modelLabel: 'Settings',
        fieldNames: ['title', 'name', 'description'] as (keyof Setting)[],
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
