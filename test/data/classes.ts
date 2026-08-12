export class Foo {
  static text = 'this is static text'

  static readonly value = 123

  private readonly sum: number

  // biome-ignore format: 折りたたまない
  constructor(readonly name: string, ...args: number[]) {
    // biome-ignore format: 折りたたまない
    for (const value of args)
      this.sum += value
  }

  bar(): Bar {
    return new Bar(this.sum)
  }
}

class Bar {
  // biome-ignore format: 折りたたまない
  constructor(private readonly value: number) {
  }

  get sum(): number {
    return this.value
  }
}
