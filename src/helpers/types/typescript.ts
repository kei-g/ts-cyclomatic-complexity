import { CompilerOptions, Program } from 'typescript'

export type TypeScriptRawConfig = {
  compilerOptions?: CompilerOptions
  exclude?: string[]
  extends?: string[] | string
  include?: string[]
}

export type TypeScriptProgram = Program & {
  sourceFiles: string[]
}
