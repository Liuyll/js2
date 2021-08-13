import ESTree, { Identifier } from 'estree'
import { FunctionVaribale } from './base/function';
import { Variable } from "./base/variable";
import { globalScope, Scope } from "./scope";

enum EVAL_OPE_COPE {
    
}

const evalOperateMap = {
    'VariableDeclaration': (node: ESTree.VariableDeclaration, scope: Scope) => {
        scope.addMembers(node.kind, new Variable(node.kind, scope))
    },
    'FunctionDeclaration': (node: ESTree.FunctionDeclaration, scope: Scope) => {
        const variable = scope.find(node.id.name)
        if(variable?.kind === 'const') return 
        /**
         * 保证每次调用时不用重新解析，在声明时做解析并缓存
         */
        const func = function() {
            // 调用作用域
            const fnScope = new Scope(scope) 
            const argumentsScope = new Scope()
            fnScope.addMembers('arguments', new Variable('const', argumentsScope, [...arguments]))
            eval2(node.body, fnScope)
        }
        scope.addMembers(node.id.name, new FunctionVaribale(scope, func))
    },
    'CallExpression': (node: ESTree.CallExpression, scope: Scope) => {
        const tag = (node.callee as Identifier).name
        const body = scope.find(tag)
        const fn = body.value
        const callee = node.callee
        let this2
        if(callee.type === 'MemberExpression') this2 = scope.find(eval2(callee.object, scope)).scope
        else this2 = globalScope

        // copy arguments
        return fn.call(this2)
    },
    'BlockStatement': (node: ESTree.BlockStatement, scope: Scope) => {
        const maybeReturnStatement = eval2(node.body[node.body.length - 1], scope)
        let executeStatetment = node.body, returnStatement
        if(maybeReturnStatement.type === 'ReturnStatement') returnStatement = executeStatetment.splice(-1, 1)
        executeStatetment.forEach(statement => {
            eval2(statement, scope)
        })
        return returnStatement && eval2(returnStatement[0], scope) 
    },
    'BinaryExpression': (node: ESTree.BinaryExpression, scope: Scope) => {
        const {left, operator, right} = node
        switch (operator) {
            case '+':
                
                break;
        
            default:
                break;
        }
    },
    'Identifier': (node: ESTree.Identifier, scope: Scope) => {
        return scope.find(node.name)
    }

}

const eval2 = (ast: ESTree.Node, scope: Scope): any => {
    
}