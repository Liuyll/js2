import { parseAST } from '../../src/index'
import fs from 'fs'
import path from 'path'

const code = fs.readFileSync(path.resolve(__dirname, '../../dist/index.js'), 'utf-8')
parseAST(code)
