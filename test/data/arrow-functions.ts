import { Foo } from './classes.ts'

export const foo = (name: string, ...args: number[]): Foo => new Foo(name, ...args)
