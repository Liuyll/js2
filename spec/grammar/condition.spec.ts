import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('Condition Test', () => {
    it('if', () => {
        const testCode = `
            let a = 10
            let b
            if(a === 10) {
                b = 5
            }
            export default b
        `
        expect(parseAST(testCode)).to.be.equal(5)
    })

    it('else if', () => {
        const testCode = `
            let a = 10
            let b
            if(a === 9) {
                b = 10
            } else if(a === 10) {
                b = 5
            }
            export default b
        `
        expect(parseAST(testCode)).to.be.equal(5)
    })

    it('multi else if', () => {
        const testCode = `
            let a = 10
            let b
            if(a === 9) {
                b = 10
            } else if(a === 8) {
                b = 10
            } else if(a === 10) {
                b = 5
            }
            export default b
        `
        expect(parseAST(testCode)).to.be.equal(5)
    })

    it('else', () => {
        const testCode = `
        let a = 10
        let b
        if(a === 9) {
            b = 10
        } else if(a === 8) {
            b = 9
        } else {
            b = 5
        }
        export default b
    `
        expect(parseAST(testCode)).to.be.equal(5)
    })

    it('only execute one branch', () => {
        const testCode = `
            let a = 10
            let b
            if(a === 10) {
                b = 5
            } else if(a === 8) {
                b = 10
            } else {
                b = 20
            }
            export default b
        `
        expect(parseAST(testCode)).to.be.equal(5)
    })

    it('if not block', () => {
        const testCode = `
        let a = 10
        let b
        if(a === 10) b = 5
        export default b
    `
        expect(parseAST(testCode)).to.be.equal(5)
    })
})