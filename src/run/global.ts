interface nativeGlobal {
    [key: string]: any
}

const globals: nativeGlobal = {
    'console': console,
    'Promise': Promise,
    'setTimeout': setTimeout,
    'setInterval': setInterval,
    'setImmediate': setImmediate,
    'Number': Number,
    'String': String,
    'Array': Array,
    'Object': Object,
    'Function': Function,
    'Proxy': Proxy
}

export {
    globals
}
