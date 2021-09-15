/**
 * 全局句柄
 */

import FuncStack from "./stack"

const funcStack = new FuncStack()
const forStack = new FuncStack()

export {
    funcStack,
    forStack
}