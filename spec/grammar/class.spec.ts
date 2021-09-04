import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('Class Test', () => {
    // a['b']
    it('constructor', () => {
        const testCode = `
            class A{}
            export default A instanceof Object
        `
        expect(parseAST(testCode)).to.be.equal(true)
    })

    it('method declaration', () => {
        const testCode = `
            class A{
                method() {
                    return 1
                }
            }
            const a = new A()
            export default a.method()
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('prop declaration', () => {
        const testCode = `
            class A{
                prop = 1
            }
            export default new A().prop
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })
})