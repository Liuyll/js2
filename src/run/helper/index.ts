import * as ESTree from 'estree'
import { Variable, VariableKind } from '../base/variable'
import { eval2 } from '../eval2'
import { Scope } from '../scope'

const getVal = (target: ESTree.Node, scope: Scope): any => {
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
const isNative = (v: Variable) => v.kind === VariableKind.Native || !v._isVariable

/**
 * @param isAssign 赋值
 */
const getWrapper = (node: ESTree.MemberExpression, scope: Scope, isAssign = false) => {
    let wrap: Variable
    if(isRecursiveMember(node.object)) wrap = getWrapper(node.object, scope)
    else if(node.object.type === 'Identifier') {
        const tag = node.object.name
        wrap = scope.find(tag)
        if(!wrap) throw Error(`MemberExpression not exist variable ${tag}`)
    }
    if(isAssign) return wrap
    const property = eval2<'Identifier', 'IdentifierNoComputed'>(node.property, scope, !node.computed)
    const value = wrap._isVariable ? wrap.property(property) : wrap[property]
    return value?._isVariable ? value.value : value
}

export {
    getVal,
    isCallDirectly,
    isRecursiveMember,
    isVariable,
    transformStringTypeToEngineType,
    assignCallArguments,
    isNative,
    getWrapper
}