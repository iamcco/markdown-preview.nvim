'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const tslib_1 = require('tslib')
const events_1 = tslib_1.__importDefault(require('events'))
const meta_1 = require('../meta')
const logger = require('../logger')('model-request')
const timeout = 30000
const callMethod = 'mkdp#nvim#api#call'
const SUPPORTED_FUNCTIONS = ['set_client_info', 'buf_attach', 'win_set_height', 'win_del_var', 'buf_detach', 'set_var', 'win_get_height', 'tabpage_list_wins', 'buf_set_lines', 'buf_set_name', 'tabpage_get_win', 'feedkeys', 'win_set_var', 'buf_get_mark', 'tabpage_set_var', 'win_get_position', 'win_get_number', 'win_set_cursor', 'win_set_option', 'win_get_cursor', 'buf_line_count', 'win_get_option', 'set_current_buf', 'set_current_tabpage', 'win_get_width', 'win_get_var', 'tabpage_get_var', 'tabpage_is_valid', 'set_option', 'buf_get_lines', 'set_current_dir', 'list_wins', 'win_set_width', 'win_get_tabpage', 'tabpage_del_var', 'del_var', 'set_current_win', 'win_is_valid', 'buf_is_valid']
function commandEscape (str) {
  return str.replace(/'/g, "''")
}
class Response extends events_1.default {
  constructor (requestType, expr) {
    super()
    this.requestType = requestType
    this.expr = expr
    this._resolved = false
    this.timer = setTimeout(() => {
      this.emit('done', `${expr} timeout after 30s`, null)
    }, timeout)
    this._promise = new Promise((resolve, reject) => {
      this.once('done', (errMsg, result) => {
        this.removeAllListeners()
        if (errMsg) { return reject(new Error(errMsg)) }
        resolve(result)
      })
    })
  }
  resolve (result) {
    if (this._resolved) { return }
    this._resolved = true
    clearTimeout(this.timer)
    if (this.requestType == 'call') {
      let [error, res] = result
      this.emit('done', error ? `call ${this.expr}: ${error.toString()}` : null, res)
    } else if (this.requestType == 'expr') {
      if (result == 'ERROR') {
        this.emit('done', `vim (E15) invalid expression: '${this.expr}'`, null)
      } else {
        this.emit('done', null, result)
      }
    }
  }
  get result () {
    return this._promise
  }
}
// request vim for result
class Request {
  constructor (conn) {
    this.conn = conn
    this.requestId = -1
    this.pendings = new Map()
    this.buffered = []
    this.supportedFuncs = SUPPORTED_FUNCTIONS.map(s => 'nvim_' + s)
    conn.once('ready', () => {
      let { buffered } = this
      for (let func of buffered) {
        func()
      }
    })
    // only used for expr and call
    conn.on('response', (requestId, res) => {
      let response = this.pendings.get(requestId)
      if (!response) { return }
      response.resolve(res)
      this.pendings.delete(requestId)
    })
  }
  // convert to id before function call
  convertArgs (args) {
    return args.map(o => {
      if (o instanceof meta_1.Window || o instanceof meta_1.Buffer || o instanceof meta_1.Tabpage) {
        return o.id
      }
      return o
    })
  }
  eval (expr) {
    let { conn } = this
    let id = this.requestId
    this.requestId = this.requestId - 1
    let res = new Response('expr', expr)
    this.pendings.set(id, res)
    if (conn.isReady) {
      conn.expr(id, expr)
    } else {
      this.buffered.push(() => {
        conn.expr(id, expr)
      })
    }
    return res.result
  }
  call (func, args) {
    let { conn } = this
    let id = this.requestId
    let isNative = !func.startsWith('nvim_')
    let fname = isNative ? func : func.slice(5)
    let arglist = [isNative ? 1 : 0, fname, args]
    this.requestId = this.requestId - 1
    let res = new Response('call', func)
    this.pendings.set(id, res)
    if (conn.isReady) {
      conn.call(id, callMethod, arglist)
    } else {
      this.buffered.push(() => {
        conn.call(id, callMethod, arglist)
      })
    }
    return res.result
  }
  command (str) {
    let { conn } = this
    if (!conn.isReady) {
      return Promise.resolve(null)
    }
    conn.commmand(str)
    return Promise.resolve(null)
  }
  callNvimFunction (method, args) {
    return tslib_1.__awaiter(this, void 0, void 0, function * () {
      args = this.convertArgs(args || [])
      let { supportedFuncs } = this
      switch (method) {
        case 'nvim_tabpage_get_win': {
          let wid = yield this.call(method, args)
          return new meta_1.Window(wid)
        }
        case 'nvim_win_get_tabpage': {
          let tabnr = yield this.call(method, args)
          return new meta_1.Tabpage(tabnr)
        }
        case 'nvim_tabpage_list_wins': {
          let win_ids = yield this.call(method, args)
          return win_ids ? win_ids.map(id => new meta_1.Window(id)) : []
        }
        case 'nvim_list_wins': {
          let win_ids = yield this.call(method, args)
          return win_ids ? win_ids.map(id => new meta_1.Window(id)) : []
        }
        case 'nvim_call_function': {
          let [fn, list] = args
          return yield this.call(fn, list)
        }
        case 'nvim_eval': {
          return yield this.eval(args[0])
        }
        case 'nvim_command': {
          return yield this.command(args[0])
        }
        case 'nvim_buf_get_var': {
          let [bufnr, name] = args
          return yield this.call('getbufvar', [bufnr, name])
        }
        case 'nvim_buf_get_changedtick': {
          let [bufnr] = args
          return yield this.call('getbufvar', [bufnr, 'changedtick', 0])
        }
        case 'nvim_buf_set_var': {
          return yield this.call('setbufvar', args)
        }
        case 'nvim_buf_del_var': {
          let [bufnr, name] = args
          return yield this.call('setbufvar', [bufnr, name, null])
        }
        case 'nvim_buf_get_option': {
          let [bufnr, opt] = args
          return yield this.call('getbufvar', [bufnr, '&' + opt])
        }
        case 'nvim_buf_set_option': {
          let [bufnr, opt, value] = args
          return yield this.call('setbufvar', [bufnr, '&' + opt, value])
        }
        case 'nvim_buf_get_name': {
          let [bufnr] = args
          return yield this.eval(`fnamemodify(bufname(${bufnr}), ':p')`)
        }
        case 'nvim_list_runtime_paths': {
          return yield this.eval(`split(&runtimepath, ',')`)
        }
        case 'nvim_command_output': {
          let [command] = args
          return yield this.call('execute', [command, 'slient'])
        }
        case 'nvim_get_current_line': {
          return yield this.call('getline', ['.'])
        }
        case 'nvim_set_current_line': {
          let [line] = args
          return yield this.call('setline', ['.', line])
        }
        case 'nvim_del_current_line': {
          return yield this.call('execute', ['normal! dd'])
        }
        case 'nvim_get_var': {
          return yield this.eval(`get(g:,'${args[0]}', v:null)`)
        }
        case 'nvim_get_vvar': {
          return yield this.eval(`get(v:,'${args[0]}', v:null)`)
        }
        case 'nvim_get_option': {
          return yield this.eval(`&${args[0]}`)
        }
        case 'nvim_get_current_buf': {
          let nr = yield this.call('bufnr', ['%'])
          return new meta_1.Buffer(nr)
        }
        case 'nvim_get_current_win': {
          let id = yield this.call('win_getid', [])
          return new meta_1.Window(id)
        }
        case 'nvim_get_current_tabpage': {
          let nr = yield this.call('tabpagenr', [])
          return new meta_1.Tabpage(nr)
        }
        case 'nvim_list_tabpages': {
          let nrs = yield this.eval(`range(1, tabpagenr('$'))`)
          return nrs.map(nr => new meta_1.Tabpage(Number(nr)))
        }
        case 'nvim_get_mode': {
          let mode = yield this.call('mode', [])
          return { mode, blocking: false }
        }
        case 'nvim_win_get_buf': {
          let id = yield this.call('winbufnr', args)
          return new meta_1.Buffer(id)
        }
        case 'nvim_call_dict_function': {
          let [dict, name, argumentList] = args
          return yield this.call('call', [name, argumentList, dict])
        }
        case 'nvim_strwidth': {
          return yield this.call('strwidth', [args[0]])
        }
        case 'nvim_out_write': {
          return yield this.command(`echon '${commandEscape(args[0])}'`)
        }
        case 'nvim_err_write': {
          return yield this.command(`echoerr '${commandEscape(args[0])}'`)
        }
        // TODO the behavior is not clear
        case 'nvim_err_writeln': {
          return yield this.command(`echoerr '${commandEscape(args[0])}'`)
        }
        case 'nvim_list_bufs': {
          let ids = yield this.eval(`map(getbufinfo({'buflisted': 1}), 'v:val["bufnr"]')`)
          return ids.map(id => new meta_1.Buffer(Number(id)))
        }
        case 'nvim_tabpage_get_number': {
          return args[0]
        }
        default:
          if (supportedFuncs.indexOf(method) !== -1) {
            let res = yield this.call(method, args || [])
            return res
          }
          console.error(`[rpc.vim] method ${method} not supported`) // tslint:disable-line
          throw new Error(`Medthod ${method} not supported`)
      }
    })
  }
}
exports.default = Request
// # sourceMappingURL=request.js.map

