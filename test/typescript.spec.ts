import { describe } from 'mocha'
import { enumerateFilesWithTypeScriptConfigAsync, loadTypeScriptConfigAsync } from '.'
import { expect } from 'chai'

type ConvertedTest = {
  body: () => Promise<void>
  name: string
}

const convert = (path: string): ConvertedTest => {
  const name = path.replace('-', ' ')
  return {
    body: async () => {
      const config = await loadTypeScriptConfigAsync(`test/conf/${path}/tsconfig.json`)
      expect(config).instanceOf(Object)
      await enumerateFilesWithTypeScriptConfigAsync(config)
    },
    name,
  }
}

describe('loadTypeScriptConfigAsync', () => ['cyclic-extends', 'empty', 'include-tools', 'multiple-extends'].map(convert).forEach((test: ConvertedTest) => it(test.name, test.body)))
