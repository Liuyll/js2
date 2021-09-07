import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('For Test', () => {
    it('for', () => {
        const testCode = `
            let j 
            for(let i = 0; i < 10; i++) j = i
            export default j
        `
        expect(parseAST(testCode)).to.be.equal(9)
    })

    it('for break', () => {
        const testCode = `
            let j 
            for(let i = 0; i < 10; i++) {
                j = i
                if(i === 3) break
            }
            export default j
        `
        expect(parseAST(testCode)).to.be.equal(3)
    })

    it('for continue', () => {
        const testCode = `
            let j = 0
            for(let i = 0; i < 10; i++) {
                if(i === 3) continue
                j++
            }
            export default j
        `
        expect(parseAST(testCode)).to.be.equal(9)
    })
})