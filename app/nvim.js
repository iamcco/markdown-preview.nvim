const attach = require('./lib/attach').default
const logger = require('./lib/util/logger')('app/nvim')
const address = process.env.MKDP_NVIM_LISTEN_ADDRESS || process.env.NVIM_LISTEN_ADDRESS || '/tmp/nvim'

const MSG_PREFIX = '[markdown-preview.vim]'

const plugin = attach({
  socket: address
})

process.on('uncaughtException', function (err) {
  let msg = `${MSG_PREFIX} uncaught exception: ` + err.stack
  if (plugin.nvim) {
    plugin.nvim.call('mkdp#util#echo_messages', ['Error', msg.split('\n')])
  }
  logger.error('uncaughtException', err.stack)
})

process.on('unhandledRejection', function (reason, p) {
  if (plugin.nvim) {
    plugin.nvim.call('mkdp#util#echo_messages', ['Error', [`${MSG_PREFIX} UnhandledRejection`, `${reason}`]])
  }
  logger.error('unhandledRejection ', p, reason)
})

exports.plugin = plugin
