import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('Binary Test', () => {
    it('instanceof', () => {
        const testCode = `
            let a = []
            export default a instanceof Array
        `
        expect(parseAST(testCode)).to.be.equal(true)
    })
})