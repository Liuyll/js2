import 'mocha'

import { expect } from 'chai';
import { parseAST } from '../../src'

describe('Promise Test', () => {
    // a['b']
    it('call', () => {
        const testCode = `
            Promise.resolve(r => {
                console.log(3)
            })
        `
        expect(parseAST(testCode))
    })
})