import ESTree from 'estree'
import { Scope } from "../scope"
import { Variable } from "./variable"

class FunctionVaribale extends Variable {
    constructor(scope: Scope, body: Function) {
        super('function', scope, body)
    }
}

export {
    FunctionVaribale
}