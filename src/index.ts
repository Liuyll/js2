import * as ESTree from 'estree'
import { Parser } from "acorn"
import { eval2 } from "./run/eval2"
import { Scope, SCOPE_TYPE } from "./run/scope"
import require2 from './module/require'
import classFields from 'acorn-class-fields'

const acornOptions = {
    ecmaVersion: 2020 as 2020,
    sourceType: 'module' as 'module',
}

type moduleExports = {
    'default': any
    [key: string]: any
}

interface IParseAST {
    (code: string, global : object, scope: Scope): moduleExports
    (code: string, global : object, isRootModule: string): moduleExports
    (code: string, global : object): moduleExports
    (code: string): moduleExports
}

const parseAST: IParseAST = (code: string, global : object = {}, scope: Scope | string = new Scope(null, global, SCOPE_TYPE.PROGRAM)): moduleExports => {
    if(typeof scope === 'string') {
        const rootModulePath: string = scope
        // isRootModule scope = rootModulePath
        scope = new Scope(null,
            {
                __inner_require__: (modulePath: string) => {
                    return require2(rootModulePath, modulePath)
                },
                __dirname: rootModulePath   
            },
            SCOPE_TYPE.PROGRAM
        )
    }
    const ast = Parser.extend(classFields).parse(code, acornOptions) as ESTree.Node
    return eval2(ast, scope)
}

console.log(parseAST(`
`
))

export {
    parseAST
}
