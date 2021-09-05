import { Scope } from '../scope'

enum VariableKind {
    Let = 1,
    Var,
    Const,
    Function,
    Native
}

class Variable {
    kind: VariableKind
    scope: Scope
    value: any
    name: string
    instanceValue: Object = {} // 实例属性 v.x
    _isVariable = true // 区分native导出prop和js定义prop

    constructor(kind: VariableKind, name: string, scope: Scope, val: any) {
        this.kind = kind
        this.scope = scope
        this.value = val
        this.name = name
    }

    /**
     * 属性访问
     */
    property(key: string) {
        if(this.kind === VariableKind.Native) return this.value[key]
        if(this.value == null) throw Error(`variable '${this.name}' find property error. This value is ${this.value}!`)
        if(Object.prototype.toString.call(this.value) === '[object Array]') {
            if(typeof key === 'number') return this.value[key].value
            else if(typeof key === 'string' && !isNaN(Number(key)) && Number(key) < 4294967296) return this.value[Number(key)].value
        }
        if(Object.prototype.toString.call(this.value) === '[object Object]') return this.value[key]
        return this.instanceValue[key]

    }

    set(val: any) {
        this.value = val
    }

    setInstanceValue(key: any, value: any) {
        if(this.value == null) throw Error(`value: ${this.value} can't set instance property.`)
        if(Object.prototype.toString.call(this.value) === '[object Object]') return this.value[key] = value
        if(Object.prototype.toString.call(this.value) === '[object Array]') {
            if(typeof key === 'number') return this.value[key] = value
            else if(typeof key === 'string' && !isNaN(Number(key))) {
                if(Number(key) < 4294967296) this.value[Number(key)] = value
                else this.instanceValue[key] = value
                return 
            } 
        } 

        this.instanceValue[key] = value
    }
}

const isJs2Variable = (v: any): v is Variable => {
    return v?._isVariable === true
}

declare interface Variable {
    call(this: any, ...argument: any[]) // 为兼容函数情况
}

export {
    Variable,
    VariableKind,
    isJs2Variable
}