import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('Variable Test', () => {
    it('var', () => {
        const testCode = `
            var a = 10
            export default a
        `
        expect(parseAST(testCode)).to.be.equal(10)
    })

    it('var in block', () => {
        const testCode = `
            {
                var a = 10
            }
            export default a
        `
        expect(parseAST(testCode)).to.be.equal(10)
    })

    it('var in for', () => {
        const testCode = `
            for(let i = 0; i < 10; i++) var a = i
            export default a
        `
        expect(parseAST(testCode)).to.be.equal(9)
    })

    it('var in function', () => {
        const testCode = `
            function test() {
                var a = 10
            }
            export default typeof a
        `
        expect(parseAST(testCode)).to.be.equal('undefined')
    })
})