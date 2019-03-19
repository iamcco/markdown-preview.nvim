'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const tslib_1 = require('tslib')
const connection_1 = tslib_1.__importDefault(require('./model/connection'))
const request_1 = tslib_1.__importDefault(require('./model/request'))
const server_1 = tslib_1.__importDefault(require('./model/server'))
const logger = require('./logger')('index')
const conn = new connection_1.default(process.stdin, process.stdout)
const request = new request_1.default(conn)
const sockFile = process.env.MKDP_NVIM_LISTEN_ADDRESS
const server = new server_1.default(sockFile, request)
server.on('ready', () => {
  conn.notify('ready')
})
server.on('connect', clientId => {
  conn.notify('connect', clientId)
})
server.on('client', (id, name) => {
  conn.commmand(`let g:vim_node_${name}_client_id = ${id}`)
})
server.on('disconnect', clientId => {
  conn.notify('disconnect', clientId)
})
server.on('notification', (event, args) => {
  if (!conn.isReady) { return }
  if (event == 'nvim_call_function') {
    conn.call(true, args[0], args[1])
  } else if (event == 'nvim_eval') {
    conn.expr(true, args[0])
  } else if (event == 'nvim_command') {
    if (/^redraw!?/.test(args[0])) {
      conn.redraw(args[0].endsWith('!'))
    } else {
      conn.commmand(args[0])
    }
  } else if (event == 'nvim_buf_set_var') {
    conn.call(true, 'setbufvar', [args[0].id, args[1], args[2]])
  } else if (event.startsWith('nvim_')) {
    conn.call(true, 'mkdp#nvim#api#call', [0, event.slice(0, 5), args])
  } else {
    logger.error(`Unknown event:`, event, args)
  }
})
conn.on('ready', () => tslib_1.__awaiter(this, void 0, void 0, function * () {
  conn.on('request', (id, obj) => tslib_1.__awaiter(this, void 0, void 0, function * () {
    let [clientId, method, args] = obj
    try {
      let res = yield server.request(clientId, method, args)
      conn.response(id, [null, res])
    } catch (e) {
      console.error(e.message) // tslint:disable-line
      conn.response(id, [e.message, null])
    }
  }))
  conn.on('notification', obj => {
    let [clientId, method, args] = obj
    server.notify(clientId, method, args)
  })
}))
process.on('uncaughtException', err => {
  logger.error('uncaughtException', err.stack)
  console.error(`[rpc.vim] rpc error ${err.message}`) // tslint:disable-line
})
process.on('unhandledRejection', (reason, p) => {
  logger.error('unhandledRejection', reason)
  let msg = '[rpc.vim] Unhandled Rejection at:' + p + ' reason: ' + reason
  console.error(msg) // tslint:disable-line
})
// # sourceMappingURL=index.js.map
