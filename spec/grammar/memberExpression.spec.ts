import 'mocha'

import { expect } from 'chai';
import { parseAST } from '../../src'

describe('MemberExpression Test', () => {
    // a['b']
    it('square get value', () => {
        const testCode = `
            const a = [1,2,3]
            export default a[0]
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('square get value by string', () => {
        const testCode = `
        const a = {
            b: 1
        }
        export default a['b']
    `
    expect(parseAST(testCode)).to.be.equal(1)
    })

    it('dot get value', () => {
        const testCode = `
        const a = {
            b: 1
        }
        export default a.b
    `
    expect(parseAST(testCode)).to.be.equal(1)
    })
})