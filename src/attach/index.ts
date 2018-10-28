import { attach, NeovimClient } from 'neovim'
import { Attach } from 'neovim/lib/attach/attach'

const logger = require('../util/logger')('attach') // tslint:disable-line

interface IApp {
  refreshPage: ((
    param: {
      bufnr: number | string
      data: any
    }
  ) => void)
  closePage: ((
    params: {
      bufnr: number | string
    }
  ) => void)
  closeAllPages: (() => void)
  openBrowser: ((
    params: {
      bufnr: number | string
    }
  ) => void)
}

interface IPlugin {
  init: ((app: IApp) => void)
  nvim: NeovimClient
}

let app: IApp

export default function(options: Attach): IPlugin {
  const nvim: NeovimClient = attach(options)

  nvim.on('notification', async (method: string, args: any[]) => {
    const opts = args[0]
    const bufnr = opts.bufnr
    const buffers = await nvim.buffers
    const buffer = buffers.find(b => b.id === bufnr)
    if (method === 'refresh_content') {
      const winline = await nvim.call('winline')
      const cursor = await nvim.call('getpos', '.')
      const name = await buffer.name
      const content = await buffer.getLines()
      const currentBuffer = await nvim.buffer
      app.refreshPage({
        bufnr,
        data: {
          isActive: currentBuffer.id === buffer.id,
          winline,
          cursor,
          name,
          content
        }
      })
    } else if (method === 'close_page') {
      app.closePage({
        bufnr
      })
    } else if (method === 'open_browser') {
      app.openBrowser({
        bufnr
      })
    }
  })

  nvim.on('request', (method: string, args: any, resp: any) => {
    if (method === 'close_all_pages') {
      app.closeAllPages()
    }
    resp.send()
  })

  nvim.channelId
    .then(async channelId => {
      await nvim.setVar('mkdp_node_channel_id', channelId)
    })
    .catch(e => {
      logger.error('channelId: ', e)
    })

  return {
    nvim,
    init: (param: IApp) => {
      app = param
    }
  }
}

