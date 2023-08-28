import {
  Stats,
  lstat,
  readFile,
  readdir,
  readlink,
  stat,
} from 'fs'

import {
  join as joinPath,
  parse as parsePath,
  resolve as resolvePath,
} from 'path'

import { promisify } from 'util'

type Action<T> = (arg: T) => void

type SymbolicLinkContext = {
  path: string
  stats: Stats
}

export const enumerateFilesAsync = async (path: string, predicate: Action<string>): Promise<void> => {
  for (const name of await readdirAsync(path)) {
    const full = joinPath(path, name)
    const ctx = {
      path: full,
      stats: await lstatAsync(full),
    }
    await resolveSymbolicLinkAsync(ctx)
    if (ctx.stats.isDirectory())
      await enumerateFilesAsync(ctx.path, predicate)
    else if (ctx.stats.isFile())
      predicate(ctx.path)
  }
}

const lstatAsync = promisify(lstat)

export const readFileAsync = promisify(readFile)

const readdirAsync = promisify(readdir)

const readlinkAsync = promisify(readlink)

const resolveSymbolicLinkAsync = async (context: SymbolicLinkContext): Promise<void> => {
  if (context.stats.isSymbolicLink()) {
    const paths: string[] = []
    await traceSymbolicLinkAsync(paths, context.path)
    context.path = paths.at(-1) as string
    context.stats = await statAsync(context.path)
  }
}

const statAsync = promisify(stat)

const traceSymbolicLinkAsync = async (paths: string[], path: string): Promise<void> => {
  const l = await lstatAsync(path)
  if (l.isSymbolicLink()) {
    const full = await readlinkAsync(path)
    const real = full.startsWith('/') ? full : resolvePath(parsePath(path).dir, full)
    paths.push(real)
    await traceSymbolicLinkAsync(paths, real)
  }
}
