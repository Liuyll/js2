import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('MemberExpression Test', () => {
    it('block scope', () => {
        const testCode = `
            {
                let a = 20
            }
            
            export default typeof a
        `
        expect(parseAST(testCode)).to.be.equal('undefined')
    })

    it('block scope var', () => {
        const testCode = `
            {
                var a = 20
            }
            
            export default a
        `
        expect(parseAST(testCode)).to.be.equal(20)
    })
    
    it('function scope', () => {
        const testCode = `
            function c() {
                return d
            }
            let d = 10
            
            export default c()
        `
        expect(parseAST(testCode)).to.be.equal(10)
    })

    it('function scope var', () => {
        const testCode = `
            function c() {
                var a = 10
            }
            
            export default typeof a
        `
        expect(parseAST(testCode)).to.be.equal('undefined')
    })

    it('function scope 2', () => {
        const testCode = `
            function c() {
                return d
            }
            let d = 10
            
            function e() {
                let d = 20
                return c()
            }
            export default c()
        `
        expect(parseAST(testCode)).to.be.equal(10)
    })


})  