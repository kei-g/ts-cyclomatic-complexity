import { argv, exit, stdin, stdout } from 'node:process'
import { calculateCyclomaticComplexityAsync } from '..'

// biome-ignore format: 折りたたまない
if (argv.includes('--abort'))
  stdin.on('data', (_data: Buffer) => (stdout.emit('error'), exit(0)))

calculateCyclomaticComplexityAsync('test/conf/data/tsconfig.json', true)
