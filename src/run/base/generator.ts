/**
 * 一种可中断、恢复的机制
 */

import * as ESTree from 'estree'
import { eval2 } from '../eval2'
import { Scope } from "../scope"

interface IGeneratorControl {
    value: any
    done: boolean
}

// only exist one generator in global.
let currentGenerator: Generator

class Generator {
    scope: Scope
    body: Function[]
    isYield: boolean
    yieldValue: any
    recovered: Function // yield in for or while

    constructor(scope: Scope, body: Function[] = []) {
        this.scope = scope
        this.body = body
    }

    push(body: Function) {
        this.body.push(body)
    }

    yield(val: any) {
        console.log('val:', val)
        this.isYield = true
        this.yieldValue = val
    }

    suspended(recovered: Function) {
        this.recovered = recovered
    }

    return(value: any, done: boolean): IGeneratorControl {
        return {
            value,
            done
        }
    }

    break(deleteBody ?: number) {
        if(this.isYield) {
            currentGenerator = null
            if(deleteBody) this.body = this.body.splice(deleteBody)
            this.isYield = false
            return this.return(this.yieldValue, false)
        }
    }

    execute() {
        currentGenerator = this
        let ret: any

        if(this.recovered) this.recovered()
        if(this.isYield) return this.break()
        
        for(let i = 0; i < this.body.length; i++) {
            ret = this.body[i]()
            if(this.isYield) return this.break(i + 1)
        }
        
        this.isYield = false
        return this.return(ret, true)
    }

}

const getCurrentGenerator = () => currentGenerator
const getCurrentGeneratorIsYield = () => currentGenerator?.isYield

export {
    Generator,
    getCurrentGenerator,
    getCurrentGeneratorIsYield
}