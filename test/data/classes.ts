export class Foo {
  static text = 'this is static text'

  static readonly value = 123

  private readonly sum: number

  constructor(readonly name: string, ...args: number[]) {
    for (const value of args)
      this.sum += value
  }

  bar(): Bar {
    return new Bar(this.sum)
  }
}

class Bar {
  constructor(private readonly value: number) {
  }

  get sum(): number {
    return this.value
  }
}
