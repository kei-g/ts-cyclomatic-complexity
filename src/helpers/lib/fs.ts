import {
  Stats,
} from 'fs'

import {
  lstat,
  readdir,
  readlink,
  stat,
} from 'fs/promises'

import {
  join as joinPath,
  parse as parsePath,
  resolve as resolvePath,
} from 'path'

type Action<T> = (arg: T) => void

type SymbolicLinkContext = {
  path: string
  stats: Stats
}

export const enumerateFilesAsync = async (path: string, callback: Action<string>): Promise<void> => {
  for (const name of await readdir(path)) {
    const full = joinPath(path, name)
    const ctx = {
      path: full,
      stats: await lstat(full),
    }
    await resolveSymbolicLinkAsync(ctx)
    if (ctx.stats.isDirectory())
      await enumerateFilesAsync(ctx.path, callback)
    else if (ctx.stats.isFile())
      callback(ctx.path)
  }
}

const resolveSymbolicLinkAsync = async (context: SymbolicLinkContext): Promise<void> => {
  if (context.stats.isSymbolicLink()) {
    const paths: string[] = []
    await traceSymbolicLinkAsync(paths, context.path)
    context.path = paths.at(-1) as string
    context.stats = await stat(context.path)
  }
}

const traceSymbolicLinkAsync = async (paths: string[], path: string): Promise<void> => {
  const l = await lstat(path)
  if (l.isSymbolicLink()) {
    const full = await readlink(path)
    const real = full.startsWith('/') ? full : resolvePath(parsePath(path).dir, full)
    paths.push(real)
    await traceSymbolicLinkAsync(paths, real)
  }
}
