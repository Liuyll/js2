import { Scope } from '../scope'

type VariableKind = 'let' | 'var' | 'const' | 'function' | 'native'
class Variable {
    kind: VariableKind
    scope: Scope
    value: any

    constructor(kind: VariableKind, scope, val ?: any) {
        this.kind = kind
        this.scope = scope
        this.value = val
    }
}

export {
    Variable
}