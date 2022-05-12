let s:mkdp_root_dir = expand('<sfile>:h:h:h')
let s:mkdp_opts = {}
let s:is_vim = !has('nvim')
let s:mkdp_channel_id = s:is_vim ? v:null : -1

function! s:on_stdout(chan_id, msgs, ...) abort
  call mkdp#util#echo_messages('Error', a:msgs)
endfunction
function! s:on_stderr(chan_id, msgs, ...) abort
  call mkdp#util#echo_messages('Error', a:msgs)
endfunction
function! s:on_exit(chan_id, code, ...) abort
  let s:mkdp_channel_id = s:is_vim ? v:null : -1
  let g:mkdp_node_channel_id = -1
endfunction

function! s:start_vim_node_rpc() abort
  if empty($MKDP_NVIM_LISTEN_ADDRESS)
    let command = mkdp#nvim#rpc#get_command()
    if empty(command) | return | endif
    call mkdp#nvim#rpc#start_server()
  endif
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
  let s:mkdp_channel_id = l:job
endfunction

function! mkdp#rpc#start_server() abort
  if s:is_vim
    call s:start_vim_node_rpc()
  endif
  let l:mkdp_server_script = s:mkdp_root_dir . '/app/bin/markdown-preview-' . mkdp#util#get_platform()
  if executable(l:mkdp_server_script)
    let l:cmd = [l:mkdp_server_script, '--path', s:mkdp_root_dir . '/app/server.js']
  elseif executable('node')
    let l:mkdp_server_script = s:mkdp_root_dir . '/app/index.js'
    let l:cmd = ['node', l:mkdp_server_script, '--path', s:mkdp_root_dir . '/app/server.js']
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
      let s:mkdp_channel_id = jobstart(l:cmd, l:nvim_optons)
    endif
  else
    call mkdp#util#echo_messages('Error', 'Pre build and node is not found')
  endif
endfunction

function! mkdp#rpc#stop_server() abort
  if s:is_vim
    if s:mkdp_channel_id !=# v:null
      let l:status = job_status(s:mkdp_channel_id)
      if l:status ==# 'run'
        if exists('g:mkdp_node_channel_id') && g:mkdp_node_channel_id !=# -1
          call mkdp#nvim#rpc#request(g:mkdp_node_channel_id, 'close_all_pages')
        endif
        try
          call job_stop(s:mkdp_channel_id)
        catch /.*/
        endtry
      endif
    endif
    let s:mkdp_channel_id = v:null
    let g:mkdp_node_channel_id = -1
  else
    if s:mkdp_channel_id !=# -1
      if exists('g:mkdp_node_channel_id') && g:mkdp_node_channel_id !=# -1
        call rpcrequest(g:mkdp_node_channel_id, 'close_all_pages')
      endif
      try
        call jobstop(s:mkdp_channel_id)
      catch /.*/
      endtry
    endif
    let s:mkdp_channel_id = -1
    let g:mkdp_node_channel_id = -1
  endif
  let b:MarkdownPreviewToggleBool = 0
endfunction

function! mkdp#rpc#get_server_status() abort
  if s:is_vim && s:mkdp_channel_id ==# v:null
    return -1
  elseif !s:is_vim && s:mkdp_channel_id ==# -1
    return -1
  elseif !exists('g:mkdp_node_channel_id') || g:mkdp_node_channel_id ==# -1
    return 0
  endif
  return 1
endfunction

function! mkdp#rpc#preview_refresh() abort
  if exists('g:mkdp_node_channel_id') && g:mkdp_node_channel_id !=# -1
    if s:is_vim
      call mkdp#nvim#rpc#notify(g:mkdp_node_channel_id, 'refresh_content', { 'bufnr': bufnr('%') })
    else
      call rpcnotify(g:mkdp_node_channel_id, 'refresh_content', { 'bufnr': bufnr('%') })
    endif
  endif
endfunction

function! mkdp#rpc#preview_close() abort
  if exists('g:mkdp_node_channel_id') && g:mkdp_node_channel_id !=# -1
    if s:is_vim
      call mkdp#nvim#rpc#notify(g:mkdp_node_channel_id, 'close_page', { 'bufnr': bufnr('%') })
    else
      call rpcnotify(g:mkdp_node_channel_id, 'close_page', { 'bufnr': bufnr('%') })
    endif
  endif
  let b:MarkdownPreviewToggleBool = 0
  call mkdp#autocmd#clear_buf()
endfunction

function! mkdp#rpc#open_browser() abort
  if exists('g:mkdp_node_channel_id') && g:mkdp_node_channel_id !=# -1
    if s:is_vim
      call mkdp#nvim#rpc#notify(g:mkdp_node_channel_id, 'open_browser', { 'bufnr': bufnr('%') })
    else
      call rpcnotify(g:mkdp_node_channel_id, 'open_browser', { 'bufnr': bufnr('%') })
    endif
  endif
endfunction

