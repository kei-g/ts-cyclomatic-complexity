import assert from 'node:assert'
import { describe } from 'mocha'
import { enumerateFilesWithTypeScriptConfigAsync, loadTypeScriptConfigAsync } from '.'

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

describe('loadTypeScriptConfigAsync', () => ['cyclic-extends', 'empty', 'include-tools', 'multiple-extends'].map(convert).forEach((test: ConvertedTest) => it(test.name, test.body)))
