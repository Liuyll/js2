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
})