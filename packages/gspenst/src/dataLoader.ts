import DataLoader from 'dataloader'
import { type SemaphoreInterface, Semaphore } from 'async-mutex'
import {
  ResultAsync,
  ok,
  err,
  okAsync,
  errAsync,
  fromPromise,
  assertUnreachable,
  do_,
  type GspenstResult,
  type ID,
} from './shared/kernel'
import { type Resource } from './domain/resource'
import repository from './repository'
import * as api from './api'
import * as Errors from './errors'
import { createLogger } from './logger'

const uniqid = Date.now()

const log = createLogger(`dataLoader:${uniqid}`)

const defaultSem = new Semaphore(100)

export type DataLoaders = ReturnType<typeof createLoaders>

export function createLoaders(
  sem: SemaphoreInterface = defaultSem,
  isBuildPhase: boolean = false
) {
  async function batchLoadFromRedis(resources: ReadonlyArray<Resource>) {
    return Promise.all(
      resources.map(async (resource) => {
        return repository
          .get(resource.id)
          .andThen((_resource) => {
            if (isBuildPhase) {
              return ok({ type: 'hit' as const, resource: _resource })
            }
            return ok({ type: 'miss' as const, resource, revalidate: true })
          })
          .unwrapOr({ type: 'miss' as const, resource, revalidate: false })
      })
    )
  }

  function batchLoadFromTina() {
    // TODO use ResultAsync<Resource[]>
    return async (
      resources: ReadonlyArray<Resource>
    ): Promise<GspenstResult<Resource>[]> => {
      log(
        'load',
        resources.map((resource) => resource.metadata.relativePath)
      )

      return Promise.all(
        resources.map(async (resource) => {
          return sem.runExclusive(async () => {
            return do_(() => {
              const { type } = resource
              switch (type) {
                case 'page': {
                  const {
                    metadata: { relativePath },
                  } = resource
                  return api.getPage({ relativePath }).map((apiPage) => ({
                    ...resource,
                    data: apiPage.data,
                  }))
                }
                case 'post': {
                  const {
                    metadata: { relativePath },
                  } = resource
                  return api.getPost({ relativePath }).map((apiPost) => ({
                    ...resource,
                    data: apiPost.data,
                  }))
                }
                case 'author': {
                  const {
                    metadata: { relativePath },
                  } = resource
                  return api.getAuthor({ relativePath }).map((apiAuthor) => ({
                    ...resource,
                    data: apiAuthor.data,
                  }))
                }
                case 'tag': {
                  const {
                    metadata: { relativePath },
                  } = resource
                  return api.getTag({ relativePath }).map((apiTag) => ({
                    ...resource,
                    data: apiTag.data,
                  }))
                }
                case 'config':
                  return api.getConfig().map((apiConfig) => ({
                    ...resource,
                    data: apiConfig.data,
                  }))
                case 'routes': {
                  return err(
                    Errors.absurd(
                      `Should not happen: routes resource is not a tina resource`
                    )
                  )
                }
                default:
                  return assertUnreachable(type)
              }
            })
          })
        })
      )
    }
  }

  const fastResourceLoader = new DataLoader<
    Resource,
    | { type: 'hit'; resource: Resource }
    | { type: 'miss'; resource: Resource; revalidate: boolean },
    ID
  >(batchLoadFromRedis, {
    cacheKeyFn: (resource) => resource.id,
  })

  const slowResourceLoader = new DataLoader<
    Resource,
    GspenstResult<Resource>,
    ID
  >(batchLoadFromTina(), {
    cacheKeyFn: (resource) => resource.id,
  })

  const loadManyResource = (resources: Resource[]) => {
    return fromPromise(
      fastResourceLoader.loadMany(resources),
      (error: unknown) =>
        Errors.other(
          `loadManyResource ${JSON.stringify(error, null, 2)}`,
          error instanceof Error ? error : undefined
        )
    ).andThen((dataLoaderResult) => {
      return ResultAsync.combine(
        dataLoaderResult.map((resourceResultOrError) => {
          if (resourceResultOrError instanceof Error) {
            return errAsync(
              Errors.other(
                `loadResource ${JSON.stringify(
                  resourceResultOrError,
                  null,
                  2
                )}`,
                resourceResultOrError instanceof Error
                  ? resourceResultOrError
                  : undefined
              )
            )
          }
          const { type, resource } = resourceResultOrError
          log(
            type,
            resource.metadata.relativePath,
            type === 'miss' ? resourceResultOrError.revalidate : undefined
          )
          if (type === 'miss') {
            return fromPromise(
              slowResourceLoader.load(resource),
              (error: unknown) =>
                Errors.other(
                  `loadManyResource ${JSON.stringify(error, null, 2)}`,
                  error instanceof Error ? error : undefined
                )
            )
              .andThen((x) => x)
              .andThen((_resource) => {
                return repository.set(_resource).map(() => _resource)
              })
              .map((_resource) => {
                log('Found from Tina: ', _resource.metadata.relativePath)
                return _resource
              })
          }

          log('Found from Redis: ', resource.metadata.relativePath)
          return okAsync(resource)
        })
      )
    })
  }

  const loadResource = (resource: Resource) => {
    return loadManyResource([resource]).andThen((resources) => {
      const _resource = resources.at(0)
      if (_resource) {
        return ok(_resource)
      }
      return err(Errors.absurd('loadResource'))
    })
  }

  return {
    loadResource,
    loadManyResource,
  }
}
