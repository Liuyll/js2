import 'mocha'

import { expect } from 'chai'
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

    it('nest object', () => {
        const testCode = `
        const a = {
            b: {
                c: 3
            }
        }
        export default a.b.c`
        expect(parseAST(testCode)).to.be.equal(3)
    })

    it('nest object array', () => {
        const testCode = `
        const a = {
            b: {
                c: [1,2,3]
            }
        }
        export default a.b.c[0]`
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('nest object array 2', () => {
        const testCode = `
        const a = {
            b: {
                c: {
                    d: 1
                }
            }
        }
        export default a.b.c.d`
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('new and get', () => {
        const testCode = `
        class A{
            prop = 1
        }
        export default new A().prop
    `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('call and get', () => {
        const testCode = `
        function A() {
            return {
                prop: 1
            }
        }
        export default A().prop
    `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('static prop', () => {
        const testCode = `
        const A = () => {}
        A.static = 'qwe'
        export default A.static
    `
        expect(parseAST(testCode)).to.be.equal('qwe')
    })

    it('set prop', () => {
        const testCode = `
        const a = {
            b: {
                c: {}
            }
        }
        a.b.c.d = 1
        export default a.b.c.d
    `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('set function prop', () => {
        const testCode = `
        const a = {
            b: {
                c: {}
            }
        }
        a.b.c.d = function() {
            return 1
        }
        export default a.b.c.d()
    `
        expect(parseAST(testCode)).to.be.equal(1)
    })
})