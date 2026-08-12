import assert from 'node:assert'
import { describe } from 'mocha'
import { enumerateFilesWithTypeScriptConfigAsync, loadTypeScriptConfigAsync } from './index.ts'

type ConvertedTest = {
  body: () => Promise<void>
  name: string
}

const convert = (path: string): ConvertedTest => {
  const name = path.replace('-', ' ')
  return {
    body: async () => {
      const config = await loadTypeScriptConfigAsync(`test/conf/${path}/tsconfig.json`)
      assert(config instanceof Object)
      await enumerateFilesWithTypeScriptConfigAsync(config)
    },
    name,
  }
}

// biome-ignore format: 折りたたまない
describe(
  'loadTypeScriptConfigAsync',
  () => {
    it('cyclic extends', convert('cyclic-extends').body)
    it('empty', convert('empty').body)
    it('include tools', convert('include-tools').body)
    it('multiple extends', convert('multiple-extends').body)
  }
)
