import { Function } from 'estree'
import {Variable} from './base/variable'

enum SET_OPE_CODE {
    SET_CONST,
    VARIABLE_NOT_FOUND,
    SET_SUCCESS
}

class Scope {
    parent: Scope | null
    members: object
    $this: object

    constructor(parent ?: Scope) {
        this.parent = parent
        this.members = {}
    }

    addMembers(tag: string, member: Variable) {
        this.members[tag] = member
    }

    find(tag: string): Variable | null {
        if(this.members[tag]) return this.members[tag]
        else return this.parent?.find(tag)
    }

    set(tag, val): SET_OPE_CODE {
        const variable = this.find(tag)
        if(!variable) return SET_OPE_CODE.VARIABLE_NOT_FOUND
        if(variable.kind === 'const') return SET_OPE_CODE.SET_CONST
        variable.value = val
        return SET_OPE_CODE.SET_SUCCESS
    }

    setNativeCall(natives: object) {
        Object.entries(natives).forEach(([tag, native]: [string, Function]) => {
            this.members[tag] = new Variable('native', this, native)
        })
    }
}

const globalScope = new Scope()

export {
    Scope,
    globalScope
}