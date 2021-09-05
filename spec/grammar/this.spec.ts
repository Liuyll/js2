import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('This Test', () => {
    it('this', () => {
        const testCode = `
            let o = {
                a: 1,
                b: function() {
                    return this.a
                }
            }
            export default o.b()
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('deep this', () => {
        const testCode = `
            let o = {
                a: 1,
                b: {
                    c: 3,
                    d() {
                        return this.c
                    }
                }
            }
            export default o.b.d()
        `
        expect(parseAST(testCode)).to.be.equal(3)
    })
})