import { Variable, VariableKind } from "./base/variable";
import * as ESTree from 'estree'
import { Scope } from "./scope"

type FunctionArguments = {
    length: number
    [key: number]: Variable
}

interface IEvalMapExtra {
    IdentifierNoComputed: 'IdentifierNoComputed'
    MemberExpressionIsCall: 'MemberExpressionIsCall'
    any: any
}

interface IEvalMap<T = any> {
    'MemberExpression': T extends 'MemberExpressionIsCall' ? [CallObject: Variable, Property: Variable] : any
    'Identifier': T extends IEvalMapExtra['IdentifierNoComputed'] ? string : Variable
    'BinaryExpression': any
    'VariableDeclarator': Variable
    'any': any 
}

interface IEvalExtraArguments {
    'VariableDeclarator': VariableKind
    'any': any
}

export {
    FunctionArguments,
    IEvalMap,
    IEvalMapExtra,
    IEvalExtraArguments
}

// type test = 'qwe' | 'zxc'

// type a<T> = T extends Extract<test, infer oo> ? oo : boolean

// const b: a<'qwe'>