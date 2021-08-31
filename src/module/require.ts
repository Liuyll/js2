import path from 'path'
import fs from 'fs'
import { parseAST } from '..'
import { Variable } from '../run/base/variable'
import { Scope } from '../run/scope'
const globalModuleCache: {[path: string]: object} = {}

const require2 = (selfPath: string, modulePath: string) => {
    const absPath = path.resolve(selfPath, modulePath)
    if(globalModuleCache[absPath]) {
        return globalModuleCache[absPath]
    } 
    if(!fs.existsSync(absPath)) throw Error(`require module: ${modulePath} is not exist in path :${absPath}`)
    const content = fs.readFileSync(absPath).toString()
    
    const moduleGlobal = {
        __inner_require__: (modulePath: string) => {
            return require2(absPath, modulePath)
        },
        __inner_export__: (name: string, value: Variable) => {
            moduleExport[name] = value
        },
        __dirname: absPath
    }
    
    const moduleScope = new Scope(null, moduleGlobal)
    const moduleExport = {}
    globalModuleCache[absPath] = moduleExport

    parseAST(content, {}, moduleScope)
    return globalModuleCache[absPath]
}

export default require2
