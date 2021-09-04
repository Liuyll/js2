import 'mocha'

import { expect } from 'chai'
import { parseAST } from '../../src'

describe('Switch Test', () => {
    it('switch', () => {
        const testCode = `
            let ret
            switch('qwe') {
                case 'qw':
                    ret = 'qw'
                case 'qwe':
                    ret = 'qwe'
            }
            export default ret
        `
        expect(parseAST(testCode)).to.be.equal('qwe')
    })

    it('switch not break', () => {
        const testCode = `
            let ret
            switch('qwe') {
                case 'qwe':
                    ret = 'qwe'
                case 'qw':
                    ret = 'qw'
            }
            export default ret
        `
        expect(parseAST(testCode)).to.be.equal('qw')
    })

    
    it('switch break', () => {
        const testCode = `
            let ret
            switch('qwe') {
                case 'qwe':
                    ret = 'qwe'
                    break
                case 'qw':
                    ret = 'qw'
            }
            export default ret
        `
        expect(parseAST(testCode)).to.be.equal('qwe')
    })
})