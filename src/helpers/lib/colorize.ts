import { SyntaxKind } from 'typescript'

type Context = {
  history: WeakSet<object>
  indent: number
  key?: string
  prefix: string
  suffix: string
}

export const colorize = (indent: number, key: string | undefined, value: unknown): string => {
  const ctx = {
    history: new WeakSet<object>(),
    indent,
    prefix: undefined,
    suffix: '  '.repeat(indent),
  } as Context
  if (key) {
    ctx.key = key
    ctx.prefix = ctx.suffix + key + ': '
  }
  else
    ctx.prefix = ctx.suffix
  return visitUnknown(ctx, value)
}

const visitArray = (ctx: Context, array: unknown[]): string => {
  const { key, prefix, suffix } = ctx
  ctx.suffix = '  '.repeat(ctx.indent++)
  ctx.prefix = ctx.suffix + (ctx.key ? ctx.key + ': [\n' : '[\n')
  const c = {
    empty: true,
    text: ctx.prefix,
  }
  ctx.key = undefined
  for (const value of array) {
    const text = visitUnknown(ctx, value)
    if (text.length)
      c.empty = false
    c.text += text
  }
  c.text += ctx.suffix + '],\n'
  ctx.indent--
  ctx.key = key
  ctx.prefix = prefix
  ctx.suffix = suffix
  return [c.text, ''][+c.empty]
}

const visitBoolean = (ctx: Context, value: boolean): string => `${ctx.prefix}\x1b[35m${['false', 'true'][+value]}\x1b[m,\n`

const visitNumber = (ctx: Context, value: bigint | number): string => {
  if (ctx.key === 'kind')
    return `${ctx.prefix}'\x1b[3m\x1b[32m${SyntaxKind[value as number]}\x1b[m',\n`
  else {
    const isFlag = ctx.key?.toLowerCase()?.includes('flags') ?? false
    const radix = [10, 16][+isFlag]
    const suffix = ['', 'h'][+isFlag]
    return `${ctx.prefix}\x1b[33m${value.toString(radix).toUpperCase()}${suffix}\x1b[m,\n`
  }
}

const visitObject = (ctx: Context, value: object): string =>
  ctx.history.has(value)
    ? ''
    : (
      ctx.history.add(value),
      value instanceof Array
        ? value.length
          ? visitArray(ctx, value)
          : ''
        : visitRecord(ctx, value as Record<string, unknown>)
    )

const visitRecord = (ctx: Context, record: Record<string, unknown>): string => {
  const { key, prefix, suffix } = ctx
  ctx.suffix = '  '.repeat(ctx.indent++)
  ctx.prefix = ctx.suffix + (ctx.key ? ctx.key + ': {\n' : '{\n')
  const c = {
    empty: true,
    text: ctx.prefix,
  }
  for (const key in record) {
    ctx.key = key
    ctx.prefix = ctx.suffix + '  ' + ctx.key + ': '
    const value = record[key]
    const text = visitUnknown(ctx, value)
    if (text.length)
      c.empty = false
    c.text += text
  }
  c.text += ctx.suffix + '},\n'
  ctx.indent--
  ctx.key = key
  ctx.prefix = prefix
  ctx.suffix = suffix
  return [c.text, ''][+c.empty]
}

const visitString = (ctx: Context, value: string): string => {
  const lines = value.split('\n').filter((line: string) => line.length)
  const index = +(lines.length < 2)
  const values = [lines[0], value]
  const suffixes = [`'\x1b[m and \x1b[33m${lines.length - 1}\x1b[m more lines`, '\x1b[m\'']
  return ctx.prefix + '\'\x1b[32m' + values[index] + suffixes[index] + ',\n'
}

const visitUnknown = (ctx: Context, value: unknown): string => {
  const name = typeof value
  return name in visitors ? (visitors[name] as (ctx: Context, value: unknown) => string)(ctx, value) : ''
}

const visitors = {
  bigint: visitNumber,
  boolean: visitBoolean,
  number: visitNumber,
  object: visitObject,
  string: visitString,
  symbol: visitString,
} as Record<string, unknown>
