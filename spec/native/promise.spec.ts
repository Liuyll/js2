import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('Promise Test', () => {
    // a['b']
    it('call', (done) => {
        const testCode = `
            new Promise(r => {
                r()
            }).then(r => done())
        `
        expect(parseAST(testCode, {
            done
        }))
    })
})