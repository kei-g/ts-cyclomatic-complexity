export type Unpacked<T> = T extends (infer E)[] ? E : never
