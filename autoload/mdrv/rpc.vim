let s:mdrv_root_dir = expand('<sfile>:h:h:h')
let s:mdrv_opts = {}
let s:is_vim = !has('nvim')
let s:mdrv_channel_id = s:is_vim ? v:null : -1

function! s:on_stdout(chan_id, msgs, ...) abort
  call mdrv#util#echo_messages('Error', a:msgs)
endfunction
function! s:on_stderr(chan_id, msgs, ...) abort
  call mdrv#util#echo_messages('Error', a:msgs)
endfunction
function! s:on_exit(chan_id, code, ...) abort
  let s:mdrv_channel_id = s:is_vim ? v:null : -1
endfunction

function! s:start_vim_server(cmd) abort
  let options = {
        \ 'in_mode': 'json',
        \ 'out_mode': 'json',
        \ 'err_mode': 'nl',
        \ 'out_cb': function('s:on_stdout'),
        \ 'err_cb': function('s:on_stderr'),
        \ 'exit_cb': function('s:on_exit'),
        \ 'env': {
        \   'VIM_NODE_RPC': 1,
        \ }
        \}
  if has("patch-8.1.350")
    let options['noblock'] = 1
  endif
  let l:job = job_start(a:cmd, options)
  let l:status = job_status(l:job)
  if l:status !=# 'run'
    echohl Error | echon 'Failed to start vim-node-rpc service' | echohl None
    return
  endif
  let s:mdrv_channel_id = l:job
endfunction

function! mdrv#rpc#start_server() abort
  let l:mdrv_server_script = s:mdrv_root_dir . '/app/bin/markdown-preview-' . mdrv#util#get_platform()
  if executable(l:mdrv_server_script)
    let l:cmd = [l:mdrv_server_script, '--path', s:mdrv_root_dir . '/app/server.js']
  elseif executable('node')
    let l:mdrv_server_script = s:mdrv_root_dir . '/app/index.js'
    let l:cmd = ['node', l:mdrv_server_script, '--path', s:mdrv_root_dir . '/app/server.js']
  endif
  if exists('l:cmd')
    if s:is_vim
      call s:start_vim_server(l:cmd)
    else
      let l:nvim_optons = {
            \ 'rpc': 1,
            \ 'on_stdout': function('s:on_stdout'),
            \ 'on_stderr': function('s:on_stderr'),
            \ 'on_exit': function('s:on_exit')
            \ }
      let s:mdrv_channel_id = jobstart(l:cmd, l:nvim_optons)
    endif
  else
    call mdrv#util#echo_messages('Error', 'Pre build and node is not found')
  endif
endfunction

function! mdrv#rpc#stop_server() abort
  if s:is_vim
    if s:mdrv_channel_id !=# v:null
      let l:status = job_status(s:mdrv_channel_id)
      if l:status ==# 'run'
        call mdrv#rpc#request(s:mdrv_channel_id, 'close_all_pages')
        try
          call job_stop(s:mdrv_channel_id)
        catch /.*/
        endtry
      endif
    endif
    let s:mdrv_channel_id = v:null
  else
    if s:mdrv_channel_id !=# -1
      call rpcrequest(s:mdrv_channel_id, 'close_all_pages')
      try
        call jobstop(s:mdrv_channel_id)
      catch /.*/
      endtry
    endif
    let s:mdrv_channel_id = -1
  endif
  let b:MarkdownReviewToggleBool = 0
endfunction

function! mdrv#rpc#get_server_status() abort
  if s:is_vim && s:mdrv_channel_id ==# v:null
    return -1
  elseif !s:is_vim && s:mdrv_channel_id ==# -1
    return -1
  endif
  return 1
endfunction

function! mdrv#rpc#preview_refresh() abort
  if s:is_vim
    if s:mdrv_channel_id !=# v:null
      call mdrv#rpc#notify(s:mdrv_channel_id, 'refresh_content', { 'bufnr': bufnr('%') })
    endif
  else
    if s:mdrv_channel_id !=# -1
      call rpcnotify(s:mdrv_channel_id, 'refresh_content', { 'bufnr': bufnr('%') })
    endif
  endif
endfunction

function! mdrv#rpc#preview_close() abort
  if s:is_vim
    if s:mdrv_channel_id !=# v:null
      call mdrv#rpc#notify(s:mdrv_channel_id, 'close_page', { 'bufnr': bufnr('%') })
    endif
  else
    if s:mdrv_channel_id !=# -1
      call rpcnotify(s:mdrv_channel_id, 'close_page', { 'bufnr': bufnr('%') })
    endif
  endif
  let b:MarkdownReviewToggleBool = 0
  call mdrv#autocmd#clear_buf()
endfunction

function! mdrv#rpc#open_browser() abort
  if s:is_vim
    if s:mdrv_channel_id !=# v:null
      call mdrv#rpc#notify(s:mdrv_channel_id, 'open_browser', { 'bufnr': bufnr('%') })
    endif
  else
    if s:mdrv_channel_id !=# -1
      call rpcnotify(s:mdrv_channel_id, 'open_browser', { 'bufnr': bufnr('%') })
    endif
  endif
endfunction

function! mdrv#rpc#request(clientId, method, ...) abort
  let args = get(a:, 1, [])
  let res = ch_evalexpr(a:clientId, [a:method, args], {'timeout': 5000})
  if type(res) == 1 && res ==# '' | return '' | endif
  let [l:errmsg, res] =  res
  if l:errmsg
    echohl Error | echon '[rpc.vim] client error: '.l:errmsg | echohl None
  else
    return res
  endif
endfunction

function! mdrv#rpc#notify(clientId, method, ...) abort
  let args = get(a:000, 0, [])
  " use 0 as vim request id
  let data = json_encode([0, [a:method, args]])
  call ch_sendraw(s:mdrv_channel_id, data."\n")
endfunction
