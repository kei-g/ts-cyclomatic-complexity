export type CyclomaticComplexity = CyclomaticComplexity[] & {
  kind: CyclomaticComplexityKind
  name: string
  value: number
}

export enum CyclomaticComplexityKind {
  ArrowFunction,
  Class,
  Function,
  Method,
  Namespace,
}
