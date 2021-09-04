import * as ESTree from 'estree'
import { Scope } from '../scope'

const binaryExpressionStrict = (node: ESTree.BinaryExpression, scope: Scope) => {
    return node
}

export {
    binaryExpressionStrict
}