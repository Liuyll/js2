import { Variable, VariableKind } from "./base/variable";

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
    'BlockStatement': any
    'any': any 
    'Literal': any
    'Computed': any
}

interface IEvalExtraArguments {
    'VariableDeclarator': VariableKind
    'BlockStatement': boolean
    'any': any
}

export {
    FunctionArguments,
    IEvalMap,
    IEvalMapExtra,
    IEvalExtraArguments
}