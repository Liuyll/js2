import * as acorn from "acorn"

const acornOptions = {
    ecmaVersion: 10 as 10,
    sourceType: 'module' as 'module',
}

const parseAST = (code: string) => {
    const ast = acorn.parse(code, acornOptions)

    
}

