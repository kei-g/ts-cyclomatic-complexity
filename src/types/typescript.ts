import { CompilerOptions } from 'typescript'

export type TypeScriptConfig = {
  compilerOptions: CompilerOptions
  exclude?: string[]
  include?: string[]
}
