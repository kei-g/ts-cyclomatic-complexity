import {
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind,
  NewLineKind,
  ScriptTarget,
  createProgram,
} from 'typescript'

import {
  parse as parseJSON5
} from 'json5'

import {
  TypeScriptConfig,
} from '../..'

import {
  TypeScriptProgram,
  TypeScriptRawConfig,
  Unpacked,
  bind1st,
  bind2nd,
  enumerateFilesAsync,
  findInLowerCase,
  readFileAsync,
} from '..'

type Action<T> = (value: T) => void

const appendFilePath = (list: Set<string>, path: string): void => {
  const [last, prev, ..._rest] = path.split('.').reverse()
  if (last === 'ts' && !(prev === 'd'))
    list.add(path)
}

const bindToPushOrAssign = <K extends keyof T, T, V extends Unpacked<T[K]>>(obj: T, key: K): Action<V> => (value: V): number => boundDoPush(obj, key, value) ?? boundDoAssign(obj, key, value)

const boundDoAssign = <K extends keyof T, T, V extends Unpacked<T[K]>>(obj: T, key: K, value: V): number => (obj[key] = [value] as unknown as T[K], 1)

const boundDoPush = <K extends keyof T, T, V extends Unpacked<T[K]>>(obj: T, key: K, value: V): number | undefined => (obj[key] as unknown as V[])?.includes(value) ? 1 : (obj[key] as unknown as V[])?.push(value)

const correctModuleResolution = (moduleResolution?: ModuleResolutionKind): ModuleResolutionKind => {
  const name = moduleResolution?.toString()?.toLowerCase()
  return findInLowerCase(ModuleResolutionKind, [name, 'node'][+(name === 'node')])
}

const correctModule = (module?: ModuleKind): ModuleKind => findInLowerCase(ModuleKind, module?.toString()?.toLowerCase())

const correctNewLine = (newLine?: NewLineKind): NewLineKind => {
  const name = newLine?.toString()?.toLowerCase()
  const patterns = {
    crlf: NewLineKind.CarriageReturnLineFeed,
    lf: NewLineKind.LineFeed,
  } as Record<string, NewLineKind>
  return patterns[name]
}

export const correctTarget = (target?: ScriptTarget): ScriptTarget => findInLowerCase(ScriptTarget, target?.toString())

export const createProgramFromTypeScriptConfigAsync = async (tsconfig: TypeScriptConfig): Promise<TypeScriptProgram> => {
  const { compilerOptions } = tsconfig
  compilerOptions.module = correctModule(compilerOptions.module)
  compilerOptions.moduleResolution = correctModuleResolution(compilerOptions.moduleResolution)
  compilerOptions.newLine = correctNewLine(compilerOptions.newLine)
  compilerOptions.target = correctTarget(compilerOptions.target)
  const sourceFiles = await enumerateFilesWithTypeScriptConfigAsync(tsconfig)
  const program = createProgram(sourceFiles, compilerOptions) as TypeScriptProgram
  program.sourceFiles = sourceFiles
  return program
}

export const enumerateFilesWithTypeScriptConfigAsync = async (tsconfig: TypeScriptConfig): Promise<string[]> => {
  const list = new Set<string>()
  const doAppend = bind1st(list, appendFilePath)
  await Promise.all((tsconfig.include ?? []).map(bind2nd(doAppend, enumerateFilesAsync)))
  return [...list]
}

const getTypeScriptRawConfig = (raw: Map<string, TypeScriptRawConfig>, configOrName: TypeScriptRawConfig | string): TypeScriptRawConfig => typeof configOrName === 'string' ? raw.get(configOrName) ?? { compilerOptions: {} } : [configOrName, { compilerOptions: {} }][+(configOrName === undefined)]

export const loadTypeScriptConfigAsync = async (path: string): Promise<TypeScriptConfig> => {
  const raw = new Map<string, TypeScriptRawConfig>()
  await loadTypeScriptRawConfigAsync(raw, path)
  return mergeTypeScriptRawConfig(raw, path)
}

const loadTypeScriptRawConfigAsync = async (map: Map<string, TypeScriptRawConfig>, path: string): Promise<void> => {
  if (!map.has(path)) {
    const config = parseJSON5<TypeScriptRawConfig>((await readFileAsync(path)).toString())
    map.set(path, config)
    if (config.extends)
      config.extends instanceof Array
        ? await Promise.all(config.extends.map(bind1st(map, loadTypeScriptRawConfigAsync)))
        : await loadTypeScriptRawConfigAsync(map, config.extends)
  }
}

const mergeCompilerOptions = (lhs: CompilerOptions, rhs: CompilerOptions): CompilerOptions => {
  const opts = lhs ?? {}
  for (const key in rhs)
    opts[key] = rhs[key]
  return opts
}

const mergeTypeScriptRawConfig = (raw: Map<string, TypeScriptRawConfig>, root: TypeScriptRawConfig | string): TypeScriptConfig => {
  const ctx = {
    config: getTypeScriptRawConfig(raw, root),
  }
  removeIfStringIsIncluded(raw, root)
  if (ctx.config.extends) {
    const config = ctx.config.extends instanceof Array
      ? ctx.config.extends.map(bind1st(raw, mergeTypeScriptRawConfig)).reduce(bind1st(raw, overrideTypeScriptConfig), { compilerOptions: {} } as TypeScriptConfig)
      : raw.get(ctx.config.extends)
    delete ctx.config.extends
    ctx.config = overrideTypeScriptConfig(raw, ctx.config as unknown as TypeScriptConfig, config)
  }
  return ctx.config as unknown as TypeScriptConfig
}

const overrideTypeScriptConfig = (raw: Map<string, TypeScriptRawConfig>, lhs: TypeScriptConfig, rhs: TypeScriptRawConfig): TypeScriptConfig => {
  const config = mergeTypeScriptRawConfig(raw, rhs)
  lhs.compilerOptions = mergeCompilerOptions(lhs.compilerOptions, rhs.compilerOptions)
  config.exclude?.forEach(bindToPushOrAssign(lhs, 'exclude'))
  config.include?.forEach(bindToPushOrAssign(lhs, 'include'))
  return lhs
}

const removeIfStringIsIncluded = (raw: Map<string, TypeScriptRawConfig>, configOrName: TypeScriptRawConfig | string): void => {
  if (typeof configOrName === 'string')
    raw.delete(configOrName)
}
