import { argv, exit, stdin, stdout } from 'process'
import { calculateCyclomaticComplexityAsync } from '..'

if (argv.includes('--abort'))
  stdin.on('data', (_data: Buffer) => (stdout.emit('error'), exit(0)))

calculateCyclomaticComplexityAsync('test/conf/data/tsconfig.json', true)
