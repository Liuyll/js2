import { Variable, VariableKind } from "./base/variable"

type FunctionArguments = {
    length: number
    [key: number]: Variable
}

interface IEvalMapExtra {
    IdentifierNoComputed: 'IdentifierNoComputed'
    MemberExpressionIsCall: 'MemberExpressionIsCall'
    any: any
}

type IsFunctionBlock = boolean

interface IEvalMap<T = any> {
    'MemberExpression': T extends 'MemberExpressionIsCall' ? [CallObject: Variable, Property: Variable] : any
    'Identifier': T extends IEvalMapExtra['IdentifierNoComputed'] ? string : Variable
    'BinaryExpression': any
    'VariableDeclarator': void
    'BlockStatement': any
    'any': any 
    'Literal': any
    'Computed': any
}

interface IEvalExtraArguments {
    'VariableDeclarator': VariableKind
    'BlockStatement': IsFunctionBlock
    'any': any
}

export {
    FunctionArguments,
    IEvalMap,
    IEvalMapExtra,
    IEvalExtraArguments
}