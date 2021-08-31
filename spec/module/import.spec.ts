import 'mocha'

import { expect } from 'chai';
import { parseAST } from '../../src'

describe('Import Test', () => {
    // a['b']
    it('named import', () => {
        const testCode = `
            import { test } from './module.ts'
            export default test()
        `
        expect(parseAST(testCode, {}, __dirname)).to.be.equal(1)
    })

    it('default import', () => {
        const testCode = `
            import test from './module.ts'
            export default test
        `
        expect(parseAST(testCode, {}, __dirname)).to.be.equal(2)
    })

    // 正常执行
    it('import function execute', () => {
        const testCode = `
            import test from './module2.ts'
            let moduleVar = 10
            export default test()
        `
        expect(parseAST(testCode, {}, __dirname)).to.be.equal(1)
    })
})