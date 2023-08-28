import { Foo } from './classes'

export const foo = (name: string, ...args: number[]): Foo => new Foo(name, ...args)
