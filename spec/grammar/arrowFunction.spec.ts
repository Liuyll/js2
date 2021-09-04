import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('ArrowFunction Test', () => {
    it('block call', () => {
        const testCode = `
            const test = () => {
                return 1
            }
            export default test()
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('return directly', () => {
        const testCode = `
            const test = () => 1
            export default test()
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('return variable directly', () => {
        const testCode = `
            let a = 1
            const test = () => a
            export default test()
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })
})