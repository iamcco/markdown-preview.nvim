if exists('g:did_mkdp_node_rpc_loaded') || v:version < 800 || has('nvim')
  finish
endif
let g:did_mkdp_node_rpc_loaded = 1

let s:is_win = has("win32") || has("win64")
let s:clientIds = []
let s:logfile = tempname()
let s:channel = v:null
let s:root_dir = resolve(expand('<sfile>:h:h:h:h'))
let s:script = s:root_dir . '/app/vimNodeRpc.js'

" env used only for testing purpose
if !empty($MKDP_NVIM_LISTEN_ADDRESS)
  call delete($MKDP_NVIM_LISTEN_ADDRESS)
  let s:tempname = $MKDP_NVIM_LISTEN_ADDRESS
else
  let s:tempname = tempname()
  if s:is_win
    let $MKDP_NVIM_LISTEN_ADDRESS = '\\?\pipe\'.s:tempname
  else
    let $MKDP_NVIM_LISTEN_ADDRESS = s:tempname
  endif
endif

if get(g:, 'mkdp_node_rpc_debug', 0)
  call ch_logfile(s:logfile, 'w')
endif

function! s:on_error(channel, msg)
  echohl Error | echom '[vim-node-rpc] rpc error: ' .a:msg | echohl None
endfunction

function! s:on_notify(channel, result)
  let [event, data] = a:result
  if event ==# 'ready'
    doautocmd User NvimMkdpRpcInit
  elseif event ==# 'connect'
    call add(s:clientIds, data)
  elseif event ==# 'disconnect'
    call filter(s:clientIds, 'v:val == '.data)
  else
    echo 'notification:'. json_encode(a:result)
  endif
endfunction

function! s:on_exit(channel)
  let s:channel = v:null
  doautocmd User NvimMkdpRpcExit
endfunction

function! mkdp#nvim#rpc#get_command() abort
  let l:pre_build = s:root_dir . '/app/bin/markdown-preview-' . mkdp#util#get_platform()
  if executable(l:pre_build)
    let l:cmd = [l:pre_build, '--path', s:script]
  elseif executable('node')
    let l:cmd = ['node', s:root_dir . '/app/index.js', '--path', s:script]
  endif
  if !exists('l:cmd')
    echohl Error | echon '[vim-node-rpc] pre build and node not found!' | echohl None
    return ''
  endif
  return l:cmd
endfunction

function! mkdp#nvim#rpc#start_server() abort
  if !empty(s:channel)
    let state = ch_status(s:channel)
    if state ==# 'open' || state ==# 'buffered'
      " running
      return
    endif
  endif
  let command = mkdp#nvim#rpc#get_command()
  if empty(command) | return | endif
  let options = {
        \ 'in_mode': 'json',
        \ 'out_mode': 'json',
        \ 'err_mode': 'nl',
        \ 'callback': function('s:on_notify'),
        \ 'err_cb': function('s:on_error'),
        \ 'close_cb': function('s:on_exit'),
        \ 'timeout': 3000,
        \ 'env': {
        \   'MKDP_NVIM_LISTEN_ADDRESS': $MKDP_NVIM_LISTEN_ADDRESS
        \ }
        \}
  if has("patch-8.1.350")
    let options['noblock'] = 1
  endif
  let job = job_start(command, options)
  let s:channel = job_getchannel(job)
  let status = ch_status(job)
  if status !=# 'open' && status !=# 'buffered'
    echohl Error | echon '[vim-node-rpc] failed to start vim-node-rpc service!' | echohl None
    return
  endif
  let info = ch_info(s:channel)
  let data = json_encode([0, ['ready', [info.id]]])
  call ch_sendraw(s:channel, data."\n")
endfunction

function! mkdp#nvim#rpc#request(clientId, method, ...) abort
  if !mkdp#nvim#rpc#check_client(a:clientId)
    return
  endif
  let args = get(a:, 1, [])
  let res = ch_evalexpr(s:channel, [a:clientId, a:method, args], {'timeout': 5000})
  if type(res) == 1 && res ==# '' | return '' | endif
  let [l:errmsg, res] =  res
  if l:errmsg
    echohl Error | echon '[rpc.vim] client error: '.l:errmsg | echohl None
  else
    return res
  endif
endfunction

function! mkdp#nvim#rpc#notify(clientId, method, ...) abort
  if empty(s:channel) | return | endif
  let args = get(a:000, 0, [])
  " use 0 as vim request id
  let data = json_encode([0, [a:clientId, a:method, args]])
  call ch_sendraw(s:channel, data."\n")
endfunction

function! mkdp#nvim#rpc#open_log()
  execute 'vs '.s:logfile
endfunction

function! mkdp#nvim#rpc#check_client(clientId)
  if empty(s:channel) | return 0 | endif
  return index(s:clientIds, a:clientId) >= 0
endfunction
