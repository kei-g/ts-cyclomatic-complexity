import assert = require('assert')

export class AutoPopStack<T> {
  private readonly array: Array<T>

  constructor(...args: T[]) {
    this.array = new Array(...args)
  }

  push(value: T): Disposable {
    this.array.push(value)
    const { array } = this
    return {
      [Symbol.dispose](): void {
        const popped = array.pop()
        assert(popped === value)
      }
    }
  }
}
