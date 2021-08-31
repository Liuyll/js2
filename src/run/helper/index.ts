import * as ESTree from 'estree';
import { Variable, VariableKind } from '../base/variable';
import { eval2 } from '../eval2';
import { Scope } from '../scope';

const getVal = (target: ESTree.Node, scope: Scope): unknown => {
    if(isVariable(target)) return scope.find(target.name)?.value
    else return (target as ESTree.Literal).value // literal
}

const isVariable = (t: ESTree.Node): t is ESTree.Identifier => {
    return t.type === 'Identifier' ? true : false
}

const isCallDirectly = (t: unknown): t is ESTree.Identifier => {
    return (t as ESTree.Identifier).type === 'Identifier'
}

const isRecursiveMember = (t: unknown): t is ESTree.MemberExpression => {
    return (t as ESTree.MemberExpression).type === 'MemberExpression'
}

const transformStringTypeToEngineType = (t: 'let' | 'var' | 'const') => {
    switch(t) {
        case 'let':
            return VariableKind.Let
        case 'var':
            return VariableKind.Var
        case 'const':
            return VariableKind.Const
    }
}

const assignCallArguments = (runArguments: Variable[], instanceArguments: any[], runScope: Scope) => {
    instanceArguments.forEach((argument, idx) => {
        if(idx >= runArguments.length) return
        runArguments[idx].set(argument)
        runScope.addMember(runArguments[idx].name, new Variable(VariableKind.Let, runArguments[idx].name, runScope, argument))
   })
}
const isNative = (v: Variable) => v.kind === VariableKind.Native

export {
    getVal,
    isCallDirectly,
    isRecursiveMember,
    isVariable,
    transformStringTypeToEngineType,
    assignCallArguments,
    isNative
}