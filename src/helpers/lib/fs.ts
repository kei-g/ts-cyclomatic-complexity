// biome-ignore format: 折りたたまない
import type {
  Stats,
} from 'node:fs'

// biome-ignore format: 折りたたまない
import {
  lstat,
  readdir,
  readlink,
} from 'node:fs/promises'

// biome-ignore format: 折りたたまない
import {
  join as joinPath,
  parse as parsePath,
  resolve as resolvePath,
} from 'node:path'

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
    // biome-ignore format: 折りたたまない
    if (ctx.stats.isDirectory())
      await enumerateFilesAsync(ctx.path, callback)
    // biome-ignore format: 折りたたまない
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
