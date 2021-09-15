import * as ESTree from 'estree'
import { isJs2Variable, Variable, VariableKind } from "./base/variable"
import { getVal, isCallDirectly, isRecursiveMember, isVariable, transformStringTypeToEngineType, assignCallArguments, isNative, getWrapper } from './helper'
import { FunctionArguments, IEvalExtraArguments, IEvalMap, IEvalMapExtra } from './interface'
import { Scope, SCOPE_TYPE } from "./scope"
import shallowCopy from 'shallow-copy'
import { forStack, funcStack } from './base/handle'
import { binaryExpressionStrict } from './helper/strict'
import { Generator, getCurrentGenerator, getCurrentGeneratorIsYield } from './base/generator'

const evalOperateMap = {
    'Program': (node: ESTree.Program, scope: Scope) => {
        let exports
        node.body.forEach(block => {
            if(block.type === 'ExportDefaultDeclaration') exports = eval2(block, scope)
            else eval2(block, scope)
        })
        return exports
    },
    'VariableDeclaration': (node: ESTree.VariableDeclaration, scope: Scope) => {
        node.declarations.forEach(variable => {
            eval2<'VariableDeclarator', 'any', 'VariableDeclarator'>(variable, scope, transformStringTypeToEngineType(node.kind))
        })
    },
    'ImportDeclaration': (node: ESTree.ImportDeclaration, scope: Scope) => {
        let defaulted: string, named: {[idx: string]: string} = {}

        node.specifiers.forEach(specify => {
            if(specify.type === 'ImportDefaultSpecifier') {
                defaulted = specify.local.name
            } else if(specify.type === 'ImportSpecifier') {
                named[specify.imported.name] = specify.local.name
            }
        })

        const require2: (modulePath: string) => any = scope.find('__inner_require__').value
        const ret = require2(node.source.value as string)

        Object.entries(named).forEach(([imported, local]) => {
            scope.addMember(local, ret[imported])
        })
        scope.addMember(defaulted, new Variable(VariableKind.Const, defaulted, scope, ret.default))
    },
    /**
     * function a() {}
     * { o: function() {} }
     * { o() {} }
     */
    'FunctionDeclaration': (node: ESTree.FunctionDeclaration, scope: Scope) => {
        const variable = scope.find(node.id.name)
        if(variable?.kind === VariableKind.Const) throw Error(`Function declaration conflict key: ${node.id.name}`)
        
        const runScope = new Scope(scope, SCOPE_TYPE.FUNCTION)
        const arguments2:FunctionArguments = { length: node.params.length }
        node.params.reduce((sum, param, idx) => {
            if(isVariable(param)) sum[idx] = new Variable(VariableKind.Let, param.name, runScope, undefined)
            // TODO: rest
            return sum
        }, arguments2)
        runScope.addMember('arguments', new Variable(VariableKind.Const, 'arguments', runScope, arguments2))
        
        scope.addMember(
            node.id.name, 
            new Variable(VariableKind.Function, (node.id as ESTree.Identifier).name, runScope, function(...args) {
                assignCallArguments(Array.from(runScope.find('arguments')!.value) as Variable[], args, runScope)
                if(this instanceof Scope) runScope.$this = this
                else {
                    runScope.$this = Object.entries(this).reduce((scope, [key, cur]: [string, Variable]) => {
                        scope.addMember(key, cur)
                        return scope
                    }, new Scope(null))
                }

                /**
                 * 支持generator
                 */
                if(node.generator) {
                    const generator = new Generator(runScope, [
                        () => eval2(node.body, runScope)
                    ])
                    return { next: () => generator.execute() }
                } 

                funcStack.addStack((node.id as ESTree.Identifier).name)

                const ret = eval2<'BlockStatement'>(node.body, runScope, true)
                funcStack.popStack()
                return ret
            })
        )
    },
    /**
     * const a = () => ...
     */
    'ArrowFunctionExpression': (node: ESTree.ArrowFunctionExpression, scope: Scope) => {
        const runScope = new Scope(scope, SCOPE_TYPE.FUNCTION)
        const arguments2:FunctionArguments = { length: node.params.length }
        node.params.reduce((sum, param, idx) => {
            if(isVariable(param)) sum[idx] = new Variable(VariableKind.Let, param.name, runScope, undefined)
            // TODO: rest
            return sum
        }, arguments2)
        runScope.addMember('arguments', new Variable(VariableKind.Const, 'arguments', runScope, arguments2))
        
        return function(...args) {
            funcStack.addStack('anonymous')

            assignCallArguments(Array.from(runScope.find('arguments')!.value) as Variable[], args, runScope)
            runScope.$this = runScope
            let ret
            if(node.body.type === 'BlockStatement') ret = eval2<'BlockStatement'>(node.body, runScope, true)
            else ret = eval2<'Computed'>(node.body, runScope)

            funcStack.popStack()
            return ret
        }
    },
    
    /**
     * const a = function() {}
     */
    'FunctionExpression': (node: ESTree.FunctionExpression, scope: Scope) => {
        const runScope = new Scope(scope, SCOPE_TYPE.FUNCTION)
        const arguments2:FunctionArguments = { length: node.params.length }
        node.params.reduce((sum, param, idx) => {
            if(isVariable(param)) sum[idx] = new Variable(VariableKind.Let, param.name, runScope, undefined)
            // TODO: rest
            return sum
        }, arguments2)
        runScope.addMember('arguments', new Variable(VariableKind.Const, 'arguments', runScope, arguments2))
        
        return function(...args) {
            funcStack.addStack((node.id as ESTree.Identifier)?.name) // 匿名函数没name

            assignCallArguments(Array.from(runScope.find('arguments')!.value) as Variable[], args, runScope)
            if(this instanceof Scope) runScope.$this = this
            else {
                runScope.$this = Object.entries(this).reduce((scope, [key, cur]: [string, Variable]) => {
                    scope.addMember(key, cur)
                    return scope
                }, new Scope(null))
            }

            const ret = eval2<'BlockStatement' | 'any'>(node.body, runScope, true)
            funcStack.popStack()
            return ret
        }
    },
    /**
     * @param isCall 是否是函数调用
     */
    'ExportNamedDeclaration': (node: ESTree.ExportNamedDeclaration, scope: Scope) => {
        const _export: (name: string, value: Variable) => void = scope.find('__inner_export__').value
        if(node.declaration) {
            const variables = eval2(node.declaration, scope)
            variables.forEach(([tag, variable]) => {
                _export(tag, variable)
            })
        } else if(node.specifiers) {
            node.specifiers.forEach(specify => {
                _export(eval2<'Identifier', 'IdentifierNoComputed'>(specify.exported, scope, true), eval2<'Identifier'>(specify.exported, scope, false, true))
            }) 
        }
    },
    'ExportDefaultDeclaration': (node: ESTree.ExportDefaultDeclaration, scope: Scope) => {
        // rootModule下不存在__inner_export__
        const _export: (name: string, value: Variable) => void = scope.find('__inner_export__')?.value
        const exportValue = eval2(node.declaration, scope)
        _export && _export('default', exportValue)
        return exportValue
    },
    'ClassDeclaration': (node: ESTree.ClassDeclaration, scope: Scope) => {
        const body = node.body.body
        let properties: [string, any][] = []
        const methods: {[key: string]: Function} = {}
        body.forEach(p => {
            if(p.type === 'PropertyDefinition') properties.push([eval2<'Identifier', 'IdentifierNoComputed'>(p.key, scope, true), eval2(p.value, scope)])
            else methods[eval2<'Identifier', 'IdentifierNoComputed'>(p.key, scope, true)] = eval2(p.value, scope)
        })
        const transformed = function() {
            const _this = this
            properties.forEach(([name, property]) => {
                _this[name] = property
            })
        }
        transformed.prototype = {
            constructor: transformed,
            ...methods
        }

        const tag = eval2(node.id, scope, true)
        scope.addMember(tag, new Variable(VariableKind.Function, tag, scope, transformed))
    },
    'VariableDeclarator': (node: ESTree.VariableDeclarator, scope: Scope, kind: VariableKind) => {
        const tag = (node.id as ESTree.Identifier).name
        const _variable = new Variable(node.init?.type === 'NewExpression' ? VariableKind.Native : kind, tag, scope, node.init ? eval2(node.init, scope) : undefined)
        if(kind === VariableKind.Var) {
            while(scope.scopeType !== SCOPE_TYPE.FUNCTION && scope.scopeType !== SCOPE_TYPE.PROGRAM) scope = scope.parent
            scope.addMember(tag, _variable)
        } else scope.addMember(tag, _variable)
    },
    'NewExpression': (node: ESTree.NewExpression, scope: Scope) => {
        const constructor = eval2(node.callee, scope, false, true)
        return new constructor.value(...Array.from(node.arguments).map(a => eval2(a, scope)))
    },
    'ArrayExpression': (node: ESTree.ArrayExpression, scope: Scope) => {
        return node.elements.map((element, idx) => new Variable(VariableKind.Let, String(idx), scope, eval2(element, scope)))
    },
    'ObjectExpression': (node: ESTree.ObjectExpression, scope: Scope) => {
        return node.properties.reduce((object, property) => {
            if(property.type === 'Property') {
                // TODO: computed = true时
                const key = eval2<'Identifier', 'IdentifierNoComputed'>(property.key, scope, !property.computed)
                object[key] = new Variable(VariableKind.Let, key, scope, eval2(property.value, scope))
                return object
            }
        }, {})
    },
    'AssignmentExpression': (node: ESTree.AssignmentExpression, scope: Scope) => {
        const val = eval2(node.right, scope)
        if(node.left.type === 'Identifier') {
            let val: Variable
            if((val = scope.find(node.left.name)!)) {
                val.set(eval2(node.right, scope))
            } else {
                throw Error(`Error: Variable ${node.left.name} is not declaration`)
            }
        } else if(node.left.type === 'MemberExpression') {
            const wrap = getWrapper(node.left, scope, true)
            const property = eval2<'Identifier', 'IdentifierNoComputed'>(node.left.property, scope, !node.left.computed)
            if(isJs2Variable(wrap)) wrap.setInstanceValue(property, val)
            else wrap[property] = val
        }
    },
    'MemberExpression': <E>(node: ESTree.MemberExpression, scope: Scope, isCall = false): E extends IEvalMapExtra['MemberExpressionIsCall'] ? [CallObject: Variable, Property: Variable] : any => {
        let wrap: Variable
        if(isRecursiveMember(node.object)) wrap = getWrapper(node.object, scope)
        else if(node.object.type === 'Identifier') {
            const tag = node.object.name
            wrap = scope.find(tag)
            if(!wrap) throw Error(`MemberExpression not exist variable ${tag}`)
        }
        else if(node.object.type === 'ThisExpression') {
            return scope.$this.find((node.property as ESTree.Identifier).name).value
        } 
        else if(node.object.type === 'CallExpression' || node.object.type === 'NewExpression') {
            wrap = eval2(node.object, scope)
        } 

        const property = eval2<'Identifier', 'IdentifierNoComputed'>(node.property, scope, !node.computed)
        const value = isJs2Variable(wrap) ? wrap.property(property) : wrap[property]
        if(isCall) return [wrap, value] as any
        return isJs2Variable(value) ? value.value : value
    },
    'CallExpression': (node: ESTree.CallExpression, scope: Scope) => {
        const argumentsCopy = node.arguments.map(argument => shallowCopy(eval2(argument, scope)))
        const _callee = node.callee
        if(isRecursiveMember(_callee)) {
            const [call, fn] = eval2<'MemberExpression', 'MemberExpressionIsCall'>(_callee, scope, true) // MemberExpression
            if(isNative(call) && isNative(fn)) {
                // call和fn都必须是js2Variable
                // native
                return fn.call(call, ...argumentsCopy)
            } else if(isNative(fn)) {
                return fn.call(call.value, ...argumentsCopy)
            } else if(isNative(call)){
                return fn.value.call(call, ...argumentsCopy)
            } else {
                // both Js2Variable
                return fn.value.call(call.value, ...argumentsCopy)
            }
        } else if(isCallDirectly(_callee)) {
            const tag = _callee.name
            const body = scope.find(tag)

            return body.value.call({}, ...argumentsCopy)
        }
    },
    'UpdateExpression': (node: ESTree.UpdateExpression, scope: Scope) => {
        let variable = eval2(node.argument, scope, false, true)
        const { operator } = node
        const isAdd = operator === '++'
        if(!node.prefix) {
            let temp = variable.value
            variable.set(isAdd ? variable.value + 1 : variable.value - 1)
            return temp
        } else {
            variable.set(isAdd ? variable.value + 1 : variable.value - 1)
            return variable.value
        }
    },
    'YieldExpression': (node: ESTree.YieldExpression, scope: Scope) => {
        const currentGenerator = getCurrentGenerator()
        currentGenerator.yield(eval2(node.argument, scope))
    },
    'BlockStatement': (node: ESTree.BlockStatement, scope: Scope, isFunction: boolean = false) => {
        const blockScope = isFunction ? scope : new Scope(scope, null, SCOPE_TYPE.BLOCK)
        let _return
        let executeStatement = node.body

        for(let statement of executeStatement) {
            eval2(statement, blockScope)
            if(funcStack.isReturn) {
                _return = funcStack.getCurrentStack()[2]
                break
            } 
        }
        
        return _return
    },
    'ForStatement': (node: ESTree.ForStatement, scope: Scope) => {
        let { init, test, update, body } = node
        const forScope = new Scope(scope, SCOPE_TYPE.FOR)
        forStack.addStack('')

        eval2(init, forScope)
        const execute = () => {
            while(eval2(test, forScope)) {
                eval2(body, forScope)
                // return 
                if(forStack.isReturn) {
                    if(forStack.getCurrentStack()[2] === 'c') {
                        forStack.isReturn = false
                        eval2(update, forScope)
                        continue
                    } else break
                }
                
                // // yield
                // if(getCurrentGeneratorIsYield()) {
                //     const waitRecover = () => {
                //         eval2(update, forScope)
                //         execute()
                //     }
                //     getCurrentGenerator().suspended(waitRecover)
                //     return
                // }
    
                eval2(update, forScope)
            }
        }
        execute()
        forStack.popStack()
    },  
    'WhileStatement': (node: ESTree.WhileStatement, scope: Scope) => {
        let test = node.test
        forStack.addStack('')
        while(eval2(test, scope)) {
            eval2(node.body, scope)
            if(forStack.isReturn) {
                if(forStack.getCurrentStack()[2] === 'c') {
                    forStack.isReturn = false
                    continue
                } else break
            }
        }
        forStack.popStack()
    },
    'BreakStatement': (node: ESTree.BreakStatement, scope: Scope) => {
        forStack.returnFunc('r')
    },
    'ContinueStatement': (node: ESTree.ContinueStatement, scope: Scope) => {
        forStack.returnFunc('c')
    },
    'ReturnStatement': (node: ESTree.ReturnStatement, scope: Scope) => {
        if(node.argument === null) return funcStack.returnFunc(undefined)
        const ret = eval2<'Computed'>(node.argument, scope)
        funcStack.returnFunc(ret)
    },
    'IfStatement': (node: ESTree.IfStatement, scope: Scope) => {
        const isExec = eval2<'BinaryExpression'>(node.test, scope)
        if(isExec) eval2(node.consequent, scope)
        else if(node.alternate) eval2(node.alternate, scope)
    },
    'SwitchStatement': (node: ESTree.SwitchStatement, scope: Scope) => {
        forStack.addStack('')
        const discriminant = eval2(node.discriminant, scope)
        let hasBreak: boolean | null = null
        for(let test of node.cases) {
            if(funcStack.isReturn) break
            if(hasBreak) break
            if(hasBreak === false) {
                for(let statement of test.consequent) {
                    eval2(statement, scope)
                }
            }
            else if(eval2(test.test, scope) === discriminant) {
                hasBreak = false
                for(let statement of test.consequent) {
                    eval2(statement, scope)
                }
            }
        }
        forStack.isReturn = false
        forStack.popStack()
    },
    'UnaryExpression': (node: ESTree.UnaryExpression, scope: Scope) => {
        switch (node.operator) {
        case 'typeof': {
            try {
                const val = eval2(node.argument, scope)
                return typeof val
            } catch(err) {
                return 'undefined'
            }
        }
        }
    },
    'LogicalExpression': (node: ESTree.LogicalExpression, scope: Scope) => {
        const { left, operator, right } = node
        switch (operator) {
        case '||':
            return getVal(left, scope) || getVal(right, scope)
        case '&&':
            return getVal(left, scope) && getVal(right, scope)
        }
    },
    'BinaryExpression': (node: ESTree.BinaryExpression, scope: Scope) => {
        // TODO: 严格模式
        if(0) return binaryExpressionStrict(node, scope)

        const { left, operator, right } = node
        switch (operator) {
        case '+':
            return (getVal(left, scope) as number) + (getVal(right, scope) as number)
        case '-':
            return (getVal(left, scope) as number) - (getVal(right, scope) as number)
        case '/':
            return (getVal(left, scope) as number) / (getVal(right, scope) as number)
        case '*':
            return (getVal(left, scope) as number) * (getVal(right, scope) as number)
        case '===':
            return getVal(left, scope) === getVal(right, scope)
        case '==':
            return getVal(left, scope) == getVal(right, scope)
        case '<':
            return getVal(left ,scope) < getVal(right, scope)
        case '>':
            return getVal(left, scope) > getVal(right, scope)
        case 'instanceof':
            return getVal(left, scope) instanceof getVal(right, scope)
        default:
            break
        }
    },
    /**
     * @param isDirect boolean 是否直接取值，eg:a.b 
     */
    'Identifier': (node: ESTree.Identifier, scope: Scope, isDirect: boolean, returnVariable: boolean): Variable | any => {
        if(isDirect) return node.name
        const variable = scope.find(node.name)
        if(!variable) throw Error(`Identifier key:${node.name} is not exist`)
        if(returnVariable) return variable
        return variable.value
    },
    'ExpressionStatement': (node: ESTree.ExpressionStatement, scope: Scope) => {
        return eval2(node.expression, scope)
    },
    'Literal': (node: ESTree.Literal, scope: Scope) => {
        return node.value
    }
}

const eval2 = <T extends keyof IEvalMap = 'any', E extends keyof IEvalMapExtra = 'any', P extends keyof IEvalExtraArguments = 'any'>(ast: ESTree.Node, scope: Scope, ...extra: IEvalExtraArguments[P][]): IEvalMap<E>[T] => {
    if(funcStack.isReturn || forStack.isReturn) return
    if(getCurrentGeneratorIsYield()) return getCurrentGenerator().push(() => evalOperateMap[ast.type](ast, scope, ...extra))

    return evalOperateMap[ast.type](ast, scope, ...extra)
}

export {
    eval2
}
