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
}

export {
    globals
}
