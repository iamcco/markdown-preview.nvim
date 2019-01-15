# vim-node-rpc

This module is made to make vim start a messagepack server as neovim
does, so that neovim remote plugins could work for vim.

Tested on vim 8.1.150, could works, but still W.I.P.

## Install

If you're using [coc.nvim](https://github.com/neoclide/coc.nvim), you just need:

```
yarn global add vim-node-rpc
```

to install it to your global yarn directory.

## How it works

![group](https://user-images.githubusercontent.com/251450/43032696-d71ef922-8cef-11e8-9ecc-392b1fbc29ed.png)

![gif](https://pic3.zhimg.com/80/v2-1e44bac755aa8b6193520c7d56dd1857_hd.gif)

## Play with it

Install [nodejs](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/en/docs/install)

Install [python-client](https://github.com/neovim/python-client) (used for testing) by:

    pip install neovim

Start testing service by:

    ./start.sh

Now you can control your vim with python-client from neovim.

Have fun.

## API

- `nvim#rpc#start_server()` start server.
- `nvim#rpc#check_client({clientId})` check if clientId available.
- `nvim#rpc#request({clientId}, {method}, [{arguments}])` send request.
- `nvim#rpc#notify({clientId}, {method}, [{arguments}])` send notification.

The `clientId` would be send to client on method `nvim_api_get_info` as
`channelId` of neovim.

A client can connect to exists RPC server by listen to `$NVIM_LISTEN_ADDRESS`
like neovim client.

## Limitation

There're some methods that no clear way to implement for vim:

- `nvim_execute_lua`
- `nvim_input`
- `nvim_buf_attach`
- `nvim_buf_detach`
- `nvim_get_hl_by_name`
- `nvim_get_hl_by_id`
- `nvim_buf_get_keymap`
- `nvim_buf_get_commands`
- `nvim_buf_add_highlight`
- `nvim_buf_clear_highlight`
- `nvim_replace_termcodes`
- `nvim_subscribe`
- `nvim_unsubscribe`
- `nvim_get_color_by_name`
- `nvim_get_color_map`
- `nvim_get_keymap`
- `nvim_get_commands`
- `nvim_get_chan_info`
- `nvim_list_chans`
- `nvim_call_atomic`
- `nvim_parse_expression`
- `nvim_get_proc_children`
- `nvim_get_proc`

Some methods requires python support of vim to work, you should either have
`has('python')` or `has('python3')` to `1` with vim.

## Tips

- `requestId > 0` for request, use `ch_evalexpr`
- `requestId = 0` for notification, use `ch_sendraw`
- `requestId < 0` for response, send by vim

Vim use new line character for the end of JSON text.

Avoid use request for vim that not response.

## LICENSE

MIT
