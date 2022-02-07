// https://github.com/stackbit/sourcebit-source-filesystem

import path from 'path'
import fse from 'fs-extra'
import grayMatter from 'gray-matter'
import type { ISourcebitPlugin, MetaData } from 'sourcebit'
import pkg from '../../package.json'

// type TagFields = Array<keyof Tag>
// type AuthorFields = Array<keyof Author>
// type PageFields = Array<keyof Page>
// type PostFields = Array<keyof Post>
// type SettingFields = Array<keyof Setting>
// type Models = ModelData<
//   TagFields | AuthorFields | PageFields | PostFields | SettingFields
// >[]

export type ContextType = {
  files?: MetaData[]
  // entries?: Entry[]
  // models?: Models
}

export type Options = {
  sources?: { name: string; path: string; label: string }[]
}

type SourebitPluginType = ISourcebitPlugin<Options, ContextType>

export const name: SourebitPluginType['name'] = pkg.name

export const options: Exclude<SourebitPluginType['options'], undefined> = {
  sources: {
    default: [
      { name: 'pages', path: 'content/pages', label: 'Pages' },
      { name: 'posts', path: 'content/posts', label: 'Posts' },
    ],
  },
}

export const bootstrap: Exclude<
  SourebitPluginType['bootstrap'],
  undefined
> = async ({
  // debug,
  // getPluginContext,
  log,
  options, //eslint-disable-line @typescript-eslint/no-shadow
  // refresh,
  setPluginContext,
}) => {
  const { sources } = options

  log('loading content files...')
  const files = await readFiles(sources)
  log(`loaded ${files.length} files`)

  setPluginContext({ files })
}

export const transform: Exclude<SourebitPluginType['transform'], undefined> = ({
  data,
  // getPluginContext,
}) => {
  return data
}

// TODO improve by https://github.com/tinacms/tinacms.org/blob/master/data-api/fetchGuides.ts
async function readFiles(sources: Options['sources'] = []) {
  const result = await Promise.all(
    sources.map(async (source) => {
      const { path: sourcePath } = source

      const absProjectPath = process.cwd()
      const absSourcePath = path.resolve(sourcePath)

      const filePaths = (await readDirRecursively(absSourcePath)).filter(
        (filePath) => {
          const extension = path.extname(filePath).substring(1)
          return ['md', 'mdx'].includes(extension)
        }
      )

      return Promise.all(
        filePaths.map(async (filePath) => {
          const absFilePath = path.join(absSourcePath, filePath)
          const relProjectPath = path.relative(absProjectPath, absFilePath)
          const relSourcePath = path.relative(absSourcePath, absFilePath)

          const { data: frontmatter, content: markdown } = grayMatter(
            await fse.readFile(absFilePath, 'utf8')
          )

          const entry = {
            ...frontmatter,
            body: markdown,
          }

          return {
            ...entry,
            __metadata: {
              id: `${convertPathToPosix(relProjectPath)}`,
              source: pkg.name,
              modelName: source.name,
              modelLabel: source.label,
              projectId: '',
              projectEnvironment: '',
              createdAt: '',
              updatedAt: '',
              sourcePath: convertPathToPosix(sourcePath),
              relSourcePath: convertPathToPosix(relSourcePath),
              relProjectPath: convertPathToPosix(relProjectPath),
            },
          }
        })
      )
    })
  )

  return result.flat()
}

async function readDirRecursively(
  dir: string,
  options?: { rootDir?: string } // eslint-disable-line @typescript-eslint/no-shadow
): Promise<string[]> {
  const rootDir = options?.rootDir ?? dir
  const files = await fse.readdir(dir)

  const result = await Promise.all(
    files.map(async (file) => {
      const absFilePath = path.join(dir, file)
      const relFilePath = path.relative(rootDir, absFilePath)
      const stats = await fse.stat(absFilePath)

      if (stats.isDirectory()) {
        return readDirRecursively(absFilePath, { rootDir })
      } else if (stats.isFile()) {
        return relFilePath
      } else {
        return []
      }
    })
  )

  return result.flat()
}

// TODO use https://www.npmjs.com/package/slash or normalize-path
function convertPathToPosix(p: string) {
  if (path.sep === path.posix.sep) {
    return p
  }
  if (!p) {
    return p
  }
  return p.split(path.sep).join(path.posix.sep)
}
