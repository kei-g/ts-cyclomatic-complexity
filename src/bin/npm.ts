import { argv } from 'process'
import { existsSync } from 'fs'

import { calculateCyclomaticComplexityAsync } from '..'

const ctx = {} as {
  path?: string
  verbose?: true
}

for (let i = 2; i < argv.length; i++)
  switch (argv[i]) {
    case '--tsconfig':
      ctx.path ??= argv[++i]
      break
    case '--verbose':
      ctx.verbose = true
      break
    default:
      if (argv[i].startsWith('--tsconfig='))
        ctx.path ??= argv[i].split('=').slice(1).join('=')
      else if (existsSync(argv[i]))
        ctx.path ??= argv[i]
      break
  }

calculateCyclomaticComplexityAsync(ctx.path ?? 'tsconfig.json', ctx.verbose)
