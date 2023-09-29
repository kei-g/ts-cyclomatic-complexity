import { TemporaryDirectory, enumerateFilesAsync } from '.'
import { cwd } from 'process'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { join as joinPath } from 'path'

describe('enumerateFilesAsync', () => {
  it('success', async () => {
    using temp = TemporaryDirectory.make({ prefix: 'ts-cyclomatic-complexity-test-' })
    temp.writeFileSync('temp', 'dummy-data')
    temp.symlinkSync(joinPath(cwd(), temp.path, 'temp'), 'foo')
    using bar = temp.mkdirSync('bar')
    bar.symlinkSync('../foo', 'baz')
    temp.symlinkSync('/dev/null', 'null')
    const paths: string[] = []
    await enumerateFilesAsync(temp.path, paths.push.bind(paths))
    expect(paths).instanceOf(Array)
  })
  it('failure', async () => {
    let caught: unknown
    const paths: string[] = []
    await enumerateFilesAsync('non-existing', paths.push.bind(paths)).catch((reason?: unknown) => caught = reason)
    expect(caught).instanceOf(Error)
  })
})
