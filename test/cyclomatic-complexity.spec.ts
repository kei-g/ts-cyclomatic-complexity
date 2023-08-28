import { IPty, spawn } from 'node-pty'
import { calculateCyclomaticComplexityAsync } from '.'
import { describe } from 'mocha'
import { env } from 'process'
import { expect } from 'chai'

const abortTest = async (): Promise<void> => {
  const pty = spawn('node', ['--require', 'esbuild-register', 'test/scripts/run.ts', '--abort'], { encoding: 'UTF-8', env })
  pty.onData(pty.write.bind(pty))
  await waitForExitAsync(pty)
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
  const pty = spawn('node', ['--require', 'esbuild-register', 'test/scripts/run.ts'], { encoding: 'UTF-8', env })
  pty.onData(omitAll)
  await waitForExitAsync(pty)
}

describe('calculateCyclomaticComplexityAsync', () => {
  it('abort', abortTest)
  it('failure', failureTest)
  it('success', successTest)
  it('verbose', verboseTest)
})

const omitAll = (_data: string): void => {
}

const waitForExitAsync = (pty: IPty): Promise<void> => new Promise<void>((resolve: () => void) => pty.onExit(resolve))
