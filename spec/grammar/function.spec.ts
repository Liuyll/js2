import 'mocha'

import { expect } from 'chai'
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
        parseAST(testCode, { done: done })
    })

    it('function return', () => {
        const testCode = `
            function test() {
                return 1
            }
            export default test()
        `
        expect(parseAST(testCode)).to.be.equal(1)
    })

    it('function only execute before return', () => {
        let current = 1
        const change = () => current = 2
        const testCode = `
            function test() {
                return 
                change()
            }
            export default test()
        `
        parseAST(testCode, { change })
        expect(current).to.be.equal(1)
    })

    it('function return in switch', () => {
        let current = 1
        const change = () => current = 2
        const testCode = `
            function test() {
                switch('qwe') {
                    case 'qwe': {
                        return 
                    }
                    case 'zxc': {
                        change()
                    }
                }
            }
            export default test()
        `
        parseAST(testCode, { change })
        expect(current).to.be.equal(1)
    })

    it('function return in n block', () => {
        let current = 1
        const change = () => current = 2
        const testCode = `
            function test() {
                {
                    {
                        {
                            {
                                {
                                    return 
                                }
                            }
                        }
                    }
                }
                change()   
            }
            export default test()
        `
        parseAST(testCode, { change })
        expect(current).to.be.equal(1)
    })


    it('function execute nest', () => {
        const testCode = `
            function B() {
                return 1
            }
            function A() {
                return B()
            }
            
            export default A()
        `
        
        expect(parseAST(testCode)).to.be.equal(1)
    })
})