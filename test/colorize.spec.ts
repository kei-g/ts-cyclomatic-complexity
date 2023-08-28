import { describe, it } from 'mocha'
import { expect } from 'chai'

import { colorize } from '.'

describe('colorize', () => {
  it('array', () => {
    const text = colorize(0, undefined, [1, 2, 3])
    expect(typeof text).equal('string')
    //expect(text).equal('[\n  \x1b[33m1\x1b[m,\n  \x1b[33m2\x1b[m,\n  \x1b[33m3\x1b[m,\n],\n')
  })
})
