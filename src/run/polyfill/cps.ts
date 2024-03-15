/**
 * 编译器进行cps转换
 */

import * as ESTree from 'estree'
import { eval2 } from '../eval2'
import { Scope, SCOPE_TYPE } from '../scope'

/**
 * 循环变递归
 */
const for2Func = (node: ESTree.ForStatement, scope: Scope) => {
    let { init, test, update, body } = node
    const forScope = new Scope(scope, SCOPE_TYPE.FOR)
      
    eval2(init, forScope)
    const $for = () => {
        if(eval2(test, forScope)) {
            eval2(body, forScope)
            eval2(update, forScope)
            $for()
        }
    }
    return $for
}

export {
    for2Func
}