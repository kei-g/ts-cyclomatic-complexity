import { describe, it } from 'mocha'
import { bind1st, bind2nd, bind3rd } from '.'
import { expect } from 'chai'

const test = (arg1: bigint, arg2: number, arg3: string) => `${arg1}:${arg2}:${arg3}`

describe('bind', () => {
  it('bind1st', () => {
    const bound = bind1st(114514n, test)
    expect(typeof bound).equal('function')
    expect(bound(3.14159265359, 'PI')).equal('114514:3.14159265359:PI')
  })
  it('bind2nd', () => {
    const bound = bind2nd(3.14159265359, test)
    expect(typeof bound).equal('function')
    expect(bound(114514n, 'PI')).equal('114514:3.14159265359:PI')
  })
  it('bind3rd', () => {
    const bound = bind3rd('PI', test)
    expect(typeof bound).equal('function')
    expect(bound(114514n, 3.14159265359)).equal('114514:3.14159265359:PI')
  })
})
