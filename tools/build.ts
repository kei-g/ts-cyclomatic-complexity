import { Format, Platform } from 'esbuild'
import { argv, env, stdout } from 'process'
import { existsSync } from 'fs'
import { join as joinPath } from 'path'
import { parse as parseJSON5, } from 'json5'
import { readFile } from 'fs/promises'
import { spawn } from 'node-pty'

import {
  bind1st,
  bind3rd,
  enumerateFilesAsync,
} from '../src/helpers'

type Build = {
  esbuild: ESBuildOption
  files: Record<string, { esbuild?: ESBuildOption, recursive?: true }>
  rewrite: Record<string, string>
}

type ESBuildOption = {
  bundle?: true
  format?: Format
  external?: string[]
  minify?: true
  outfile?: string
  platform?: Platform
  target?: string
}

const bindToAppend = <T>(list: T[]): (value: T, index: number, array: T[]) => number => (value: T, _index: number, _array: T[]) => list.push(value)

const buildAsync = async (ctx: Build, esbuild: ESBuildOption | undefined, name: string, rewrite: Map<RegExp, string>): Promise<void> => {
  const opts = {
    bundle: mergeProperty('bundle', esbuild, ctx.esbuild, false),
    external: esbuild?.external?.concat(ctx.esbuild?.external ?? []) ?? ctx.esbuild?.external,
    format: mergeProperty('format', esbuild, ctx.esbuild, 'cjs'),
    minify: mergeProperty('minify', esbuild, ctx.esbuild, false),
    outfile: mergeProperty('outfile', esbuild, ctx.esbuild, name),
    platform: mergeProperty('platform', esbuild, ctx.esbuild, 'node'),
    target: mergeProperty('target', esbuild, ctx.esbuild, 'node16'),
  } as {
    external?: string[]
    outfile: string
  }
  const args = createArrayAsArguments(name, opts, rewrite)
  const proc = spawn('node_modules/esbuild/bin/esbuild', args, { encoding: 'UTF-8', env })
  proc.onData(stdout.write.bind(stdout))
  return new Promise(proc.onExit.bind(proc))
}

const compileRegExp = (source: Record<string, string>): Map<RegExp, string> => {
  const map = new Map<RegExp, string>()
  for (const key in source)
    map.set(new RegExp(key, 'g'), source[key])
  return map
}

const composeExternal = (value: string) => `--external:${value}`

const createArrayAsArguments = (name: string, opts: ESBuildOption, rewrite: Map<RegExp, string>): string[] => {
  deleteUndefinedFields(opts)
  rewriteOutputFilePath(opts as unknown as { outfile: string }, rewrite)
  const args = [name]
  const doAppend = bindToAppend(args)
  for (const key in opts)
    key === 'external' ? opts[key]?.map(composeExternal)?.forEach(doAppend) : args.push(`--${key}=${opts[key]}`)
  return args
}

const deleteUndefinedFields = (obj: Record<string, unknown>): void => {
  for (const key in obj)
    if (obj[key] === undefined)
      delete obj[key]
}

const getProperty = <T>(key: keyof ESBuildOption, esbuild?: ESBuildOption): T => (esbuild === undefined ? undefined : esbuild[key]) as unknown as T

const main = async (path: string): Promise<void> => {
  const ctx = parseJSON5<Build>((await readFile(path)).toString())
  const rewrite = compileRegExp(ctx.rewrite)
  const bound = bind3rd(rewrite, bind1st(ctx, buildAsync))
  const tasks = [] as Promise<void>[]
  for (const name in ctx.files) {
    const record = ctx.files[name]
    if (record.recursive) {
      const list = [] as string[]
      const doAppend = list.push.bind(list)
      await enumerateFilesAsync(name, doAppend)
      tasks.push(...list.map(bind1st(record.esbuild, bound)))
    }
    else
      tasks.push(buildAsync(ctx, record.esbuild, name, rewrite))
  }
  await Promise.all(tasks)
}

const mergeProperty = <T>(key: keyof ESBuildOption, esb1: ESBuildOption | undefined, esb2: ESBuildOption, defaultValue: T): T => (getProperty(key, esb1) ?? esb2[key] ?? defaultValue) as unknown as T

const rewriteOutputFilePath = (opts: { outfile: string }, rewrite: Map<RegExp, string>): void => {
  for (const e of rewrite.entries())
    opts.outfile = opts.outfile.replace(e[0], e[1])
}

const ctx = {} as {
  path?: string
}

for (let i = 2; i < argv.length; i++)
  switch (argv[i]) {
    case '--build':
      ctx.path ??= argv[++i]
      break
    default:
      if (argv[i].startsWith('--build='))
        ctx.path ??= argv[i].split('=').slice(1).join('=')
      else if (existsSync(argv[i]))
        ctx.path ??= argv[i]
      break
  }

main(joinPath(__dirname, ctx.path ?? '.build.json'))
