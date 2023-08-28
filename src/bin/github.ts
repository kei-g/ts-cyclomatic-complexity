import { calculateCyclomaticComplexityAsync } from '..'
import { getInput, setOutput } from '@actions/core'

const main = async (): Promise<void> => {
  const result = await calculateCyclomaticComplexityAsync(getInput('tsconfigPath') ?? 'tsconfig.json')
  setOutput('whole-result', JSON.stringify(result))
}

main()
