import 'mocha'

import { expect } from 'chai';
import { parseAST } from '../../src'

describe('Function Test', () => {
    // a['b']
    it('call', () => {
        const testCode = `
            function test() {
                return 1
            }
            export default test()
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('function argument', () => {
        const testCode = `
            function test(param) {
                return param
            }
            export default test(1)
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('function as argument', (done) => {
        const testCode = `
            let flag = 0
            function test() {
                done()
            }
            setTimeout(test, 0)
        `
        parseAST(testCode, {done: done})
    })
})