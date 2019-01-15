import fs from 'fs'
import Module from 'module'
import path from 'path'
import vm from 'vm'

import modules from './preloadmodules'

export default function load(scriptPath) {
  const userModule = new Module(scriptPath)
  userModule.filename = scriptPath
  userModule.paths = (Module as any)._nodeModulePaths(path.dirname(scriptPath))

  const moduleCode = fs.readFileSync(userModule.filename, 'utf-8')

  userModule.require = userModule.require.bind(userModule)

  const sanbox = vm.createContext({
    exports: userModule.exports,
    module: userModule,
    require: name => {
      if (modules[name]) {
        return modules[name]
      }
      return userModule.require(name)
    },
    __filename: userModule.filename,
    __dirname: path.dirname(scriptPath)
  })

  vm.runInContext(moduleCode, sanbox, { filename: userModule.filename })

  return userModule.exports
}
