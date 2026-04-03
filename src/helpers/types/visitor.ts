import type { CyclomaticComplexity } from '../../index.ts'
import type { Node } from 'typescript'
import type { AutoPopStack } from '../lib/index.ts'

export type VisitorContext = {
  complexities: CyclomaticComplexity[]
  currentComplexity?: CyclomaticComplexity
  nodeStack: AutoPopStack<Node>
  verbose?: boolean
}

export type Visitor = (context: VisitorContext, node: Node) => void
