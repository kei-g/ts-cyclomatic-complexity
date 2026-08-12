import assert from 'node:assert'
import { spawn } from 'node:child_process'
import { env } from 'node:process'
import { promisify } from 'node:util'
import { describe } from 'mocha'
import { calculateCyclomaticComplexityAsync } from './index.ts'

const abortTest = async (): Promise<void> => {
  const cp = spawn('node', ['--require', 'esbuild-register', 'test/scripts/run.ts', '--abort'], { env })
  cp.stdout.on('data', cp.stdin.write.bind(cp.stdin))
  await promisify(cp.on.bind(cp))('exit')
}

const failureTest = async (): Promise<void> => {
  let caught: unknown
  await calculateCyclomaticComplexityAsync('non-existing').catch((reason?: unknown) => (caught = reason))
  assert(caught instanceof Error)
}

const successTest = async (): Promise<void> => {
  const complexity = await calculateCyclomaticComplexityAsync('test/conf/data/tsconfig.json')
  assert(complexity instanceof Object)
}

const verboseTest = async (): Promise<void> => {
  const cp = spawn('node', ['--require', 'esbuild-register', 'test/scripts/run.ts'], { env })
  cp.stdout.on('data', omitAll)
  await promisify(cp.on.bind(cp))('exit')
}

// biome-ignore format: 折りたたまない
describe(
  'calculateCyclomaticComplexityAsync',
  () => {
    it('abort', abortTest)
    it('failure', failureTest)
    it('success', successTest)
    it('verbose', verboseTest)
  }
)

// biome-ignore format: 折りたたまない
const omitAll = (_: unknown) => {
}
