import {
  Stats,
} from 'fs'

import {
  lstat,
  readdir,
  readlink,
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
  while (context.stats.isSymbolicLink()) {
    const path = await readlink(context.path)
    context.path = path.startsWith('/') ? path : resolvePath(parsePath(context.path).dir, path)
    context.stats = await lstat(context.path)
  }
}
