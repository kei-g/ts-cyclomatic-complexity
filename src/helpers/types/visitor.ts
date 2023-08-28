import { CyclomaticComplexity } from '../..'
import { Node } from 'typescript'
import { AutoPopStack } from '../lib'

export type VisitorContext = {
  complexities: CyclomaticComplexity[]
  currentComplexity?: CyclomaticComplexity
  nodeStack: AutoPopStack<Node>
  verbose?: boolean
}

export type Visitor = (context: VisitorContext, node: Node) => void
