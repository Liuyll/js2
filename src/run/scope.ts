import {Variable, VariableKind} from './base/variable'
import { globals } from './global'

enum SET_OPE_CODE {
    SET_CONST,
    VARIABLE_NOT_FOUND,
    SET_SUCCESS
}

enum SCOPE_TYPE {
    PROGRAM
}
class Scope {
    parent: Scope | null
    members: object
    $this: Scope
    scopeName: SCOPE_TYPE

    constructor(parent ?: Scope, global ?: object, scopeName ?: SCOPE_TYPE) {
        this.parent = parent
        this.members = {}
        if(global) {
            this.parent = globalScopeFactory(global)
        }
        this.scopeName = scopeName
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