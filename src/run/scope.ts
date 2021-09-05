import { globals } from './global'
import { Variable, VariableKind } from './base/variable'

enum SET_OPE_CODE {
    SET_CONST,
    VARIABLE_NOT_FOUND,
    SET_SUCCESS
}

enum SCOPE_TYPE {
    PROGRAM = 1,
    FUNCTION,
    BLOCK,
    FOR
}
class Scope {
    parent: Scope | null
    members: object
    $this: Scope
    scopeType: SCOPE_TYPE

    constructor(parent: Scope)
    constructor(parent: Scope, scopeType: SCOPE_TYPE)
    constructor(parent: Scope, global: boolean | object)
    constructor(parent: Scope, global: boolean | object, scopeType: SCOPE_TYPE)
    constructor(parent: Scope, global ?: object | SCOPE_TYPE | boolean, scopeType ?: SCOPE_TYPE) {
        this.parent = parent
        this.members = {}
        if(global) {
            if(global === true || typeof global === 'object') {
                this.parent = globalScopeFactory(global)
                this.scopeType = scopeType
            }
            else this.scopeType = global
        } else this.scopeType = scopeType
    }

    addMember(tag: string, member: Variable) {
        this.members[tag] = member
    }

    find(tag: string): Variable | null {
        if(this.members[tag]) return this.members[tag]
        else return this.parent?.find(tag)
    }

    set(tag, val): SET_OPE_CODE {
        const variable = this.find(tag)
        if(!variable) return SET_OPE_CODE.VARIABLE_NOT_FOUND
        if(variable.kind === VariableKind.Const) return SET_OPE_CODE.SET_CONST
        variable.set(val)
        return SET_OPE_CODE.SET_SUCCESS
    }
}

const globalScopeFactory = (global: Object = {}) => {
    const globalScope = new Scope(null)
    if(global === true) global = {}
    Object.entries(globals).forEach(([n, v]) => globalScope.addMember(n, new Variable(VariableKind.Native, n, globalScope, v)))
    typeof global === 'object' && Object.entries(global).forEach(([n, v]) => {
        globalScope.addMember(n,  new Variable(VariableKind.Native, n, globalScope, v))
    })
    
    return globalScope
}

export {
    Scope,
    SCOPE_TYPE
}