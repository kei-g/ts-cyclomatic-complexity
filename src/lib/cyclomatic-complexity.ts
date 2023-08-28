import {
  ArrowFunction,
  AwaitExpression,
  Block,
  CallExpression,
  ClassDeclaration,
  ExpressionStatement,
  FunctionDeclaration,
  Node,
  ObjectLiteralExpression,
  PropertyAccessExpression,
  SyntaxKind,
  VariableDeclaration,
} from 'typescript'

import { stdout } from 'process'

import { CyclomaticComplexity } from '..'

import {
  AutoPopStack,
  Visitor,
  VisitorContext,
  bind1st,
  colorize,
  createProgramFromTypeScriptConfigAsync,
  loadTypeScriptConfigAsync,
} from '../helpers'

export const calculateCyclomaticComplexityAsync = async (path: string, verbose?: true): Promise<CyclomaticComplexity[]> => {
  const tsconfig = await loadTypeScriptConfigAsync(path)
  const program = await createProgramFromTypeScriptConfigAsync(tsconfig)
  const context = {
    complexities: [],
    nodeStack: new AutoPopStack<Node>(),
  } as VisitorContext
  if (verbose) {
    context.verbose = true
    stdout.on('error', doNothing)
  }
  for (const name of program.sourceFiles) {
    const source = program.getSourceFile(name)
    if (context.verbose)
      stdout.write(colorize(0, `'\x1b[32m${name}\x1b[m'`, source))
    visitNode(context, source)
  }
  return context.complexities
}

const doNothing = () => {
}

const visitNode = (context: VisitorContext, node: Node): void => {
  const kind = SyntaxKind[node.kind]
  if (kind in visitors)
    visitors[kind](context, node)
  using _auto = context.nodeStack.push(node)
  node.forEachChild(bind1st(context, visitNode))
}

const visitProperty = <T extends Node>(context: VisitorContext, node: T, prop: keyof T): void => {
  const value = node[prop] as unknown as Node
  if (value) {
    using _auto = context.nodeStack.push(node)
    visitNode(context, value)
  }
}

const visitors = {
  ArrowFunction: (context: VisitorContext, node: ArrowFunction) => {
    visitProperty(context, node, 'body')
  },
  AwaitExpression: (context: VisitorContext, node: AwaitExpression) => {
    visitProperty(context, node, 'expression')
  },
  BinaryExpression: (_context: VisitorContext, _node: Node) => {
  },
  Block: (context: VisitorContext, node: Block) => {
    using _auto = context.nodeStack.push(node)
    for (const statement of node.statements)
      visitNode(context, statement)
  },
  CallExpression: (context: VisitorContext, node: CallExpression) => {
    using _auto = context.nodeStack.push(node)
    for (const callArgument of node.arguments)
      visitNode(context, callArgument)
    visitNode(context, node.expression)
  },
  ClassDeclaration: (context: VisitorContext, node: ClassDeclaration) => {
    using _auto = context.nodeStack.push(node)
    for (const member of node.members)
      visitNode(context, member)
  },
  ExpressionStatement: (context: VisitorContext, node: ExpressionStatement) => {
    visitProperty(context, node, 'expression')
  },
  FirstStatement: (_context: VisitorContext, _node: Node) => {
  },
  FunctionDeclaration: (context: VisitorContext, node: FunctionDeclaration) => {
    visitProperty(context, node, 'body')
  },
  ObjectLiteralExpression: (context: VisitorContext, node: ObjectLiteralExpression) => {
    using _auto = context.nodeStack.push(node)
    for (const property of node.properties)
      visitNode(context, property)
  },
  PropertyAccessExpression: (context: VisitorContext, node: PropertyAccessExpression) => {
    visitProperty(context, node, 'expression')
  },
  SourceFile: (_context: VisitorContext, _node: Node) => {
  },
  VariableDeclaration: (context: VisitorContext, node: VariableDeclaration) => {
    visitProperty(context, node, 'initializer')
  },
  VariableDeclarationList: (_context: VisitorContext, _node: Node) => {
  },
} as unknown as Record<string, Visitor>
