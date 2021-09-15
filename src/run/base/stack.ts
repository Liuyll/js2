type funcMeta = [Symbol, string, any] // only flag, name, return

class FuncStack {
    stack: funcMeta[] = []
    isReturn: boolean = false
    constructor() {}

    addStack(name: string) {
        const symbol = Symbol()
        this.stack.push([symbol, name, symbol])
        return symbol
    }

    popStack() {
        this.isReturn = false
        this.stack.pop()
    }

    returnFunc(ret) {
        this.isReturn = true
        this.getCurrentStack()[2] = ret
    }

    inCurrentStack(symbol: Symbol) {
        return symbol === this.getCurrentStack()[0]
    }

    getCurrentStack() {
        return this.stack[this.stack.length - 1]
    }
}

export default FuncStack
