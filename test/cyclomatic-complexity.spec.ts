import { calculateCyclomaticComplexityAsync } from '.'
import { describe } from 'mocha'
import { env } from 'process'
import { expect } from 'chai'
import { promisify } from 'util'
import { spawn } from 'child_process'

const abortTest = async (): Promise<void> => {
  const cp = spawn('node', ['--require', 'esbuild-register', 'test/scripts/run.ts', '--abort'], { env })
  cp.stdout.on('data', cp.stdin.write.bind(cp.stdin))
  await promisify(cp.on.bind(cp))('exit')
}

const failureTest = async (): Promise<void> => {
  let caught: unknown
  await calculateCyclomaticComplexityAsync('non-existing').catch((reason?: unknown) => caught = reason)
  expect(caught).instanceOf(Error)
}

const successTest = async (): Promise<void> => {
  const _complexity = await calculateCyclomaticComplexityAsync('test/conf/data/tsconfig.json')
  expect(_complexity).instanceOf(Object)
}

const verboseTest = async (): Promise<void> => {
  const cp = spawn('node', ['--require', 'esbuild-register', 'test/scripts/run.ts'], { env })
  cp.stdout.on('data', omitAll)
  await promisify(cp.on.bind(cp))('exit')
}

describe(
  'calculateCyclomaticComplexityAsync',
  () => {
    it('abort', abortTest)
    it('failure', failureTest)
    it('success', successTest)
    it('verbose', verboseTest)
  }
)

const omitAll = (_: unknown) => {
}
