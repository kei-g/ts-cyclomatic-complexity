import assert from 'node:assert'
import { TemporaryDirectory, enumerateFilesAsync } from '.'
import { cwd } from 'node:process'
import { describe, it } from 'mocha'
import { join as joinPath } from 'node:path'

describe('enumerateFilesAsync', () => {
  it('success', async () => {
    const temp = TemporaryDirectory.make({ prefix: 'ts-cyclomatic-complexity-test-' })
    temp.writeFileSync('temp', 'dummy-data')
    temp.symlinkSync(joinPath(cwd(), temp.path, 'temp'), 'foo')
    const bar = temp.mkdirSync('bar')
    bar.symlinkSync('../foo', 'baz')
    temp.symlinkSync('/dev/null', 'null')
    const paths: string[] = []
    await enumerateFilesAsync(temp.path, paths.push.bind(paths))
    assert(Array.isArray(paths))
    bar[Symbol.dispose]()
    temp[Symbol.dispose]()
  })
  it('failure', async () => {
    let caught: unknown
    const paths: string[] = []
    await enumerateFilesAsync('non-existing', paths.push.bind(paths)).catch((reason?: unknown) => caught = reason)
    assert(caught instanceof Error)
  })
})
