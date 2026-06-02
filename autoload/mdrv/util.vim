let s:mdrv_root_dir = expand('<sfile>:h:h:h')
let s:pre_build = s:mdrv_root_dir . '/app/bin/markdown-preview-'
let s:package_file = s:mdrv_root_dir . '/package.json'

" echo message
function! mdrv#util#echo_messages(hl, msgs)
  if empty(a:msgs) | return | endif
  execute 'echohl '.a:hl
  if type(a:msgs) ==# 1
    echomsg a:msgs
  else
    for msg in a:msgs
      echom msg
    endfor
  endif
  echohl None
endfunction

" echo url
function! mdrv#util#echo_url(url)
  let l:url = 'Preview page: ' . a:url
  call mdrv#util#echo_messages('Type', l:url)
endfunction

" try open preview page
function! s:try_open_preview_page(timer_id) abort
  let l:server_status = mdrv#rpc#get_server_status()
  if l:server_status !=# 1
    let s:try_id = ''
    call mdrv#rpc#stop_server()
    call mdrv#rpc#start_server()
  endif
endfunction

" open preview page
function! mdrv#util#open_preview_page() abort
  if get(s:, 'try_id', '') !=# ''
    return
  endif
  let l:server_status = mdrv#rpc#get_server_status()
  if l:server_status ==# -1
    call mdrv#rpc#start_server()
  elseif l:server_status ==# 0
    let s:try_id = timer_start(1000, function('s:try_open_preview_page'))
  else
    call mdrv#util#open_browser()
  endif
endfunction

" auto refetch combine preview
function! mdrv#util#combine_preview_refresh() abort
  if g:mdrv_clients_active && !g:mdrv_auto_start
    call mdrv#util#open_browser()
  endif
endfunction

" open browser
function! mdrv#util#open_browser() abort
  call mdrv#rpc#open_browser()
  call mdrv#autocmd#init()
endfunction

function! mdrv#util#stop_preview() abort
  let g:mdrv_clients_active = 0
  " TODO: delete autocmd
  call mdrv#rpc#stop_server()
endfunction

function! mdrv#util#get_platform() abort
  if has('win32') || has('win64')
    return 'win'
  elseif has('mac') || has('macvim')
    if system('arch') =~? 'arm64'
      return 'macos-arm64'
    endif
    return 'macos'
  endif
  return 'linux'
endfunction

function! s:on_exit(autoclose, bufnr, Callback, job_id, status, ...)
  let content = join(getbufline(a:bufnr, 1, '$'), "\n")
  if a:status == 0 && a:autoclose == 1
    execute 'silent! bd! '.a:bufnr
  endif
  if !empty(a:Callback)
    call call(a:Callback, [a:status, a:bufnr, content])
  endif
endfunction

function! mdrv#util#open_terminal(opts) abort
  if get(a:opts, 'position', 'bottom') ==# 'bottom'
    let p = '5new'
  else
    let p = 'vnew'
  endif
  execute 'belowright '.p.' +setl\ buftype=nofile '
  setl buftype=nofile
  setl winfixheight
  setl norelativenumber
  setl nonumber
  setl bufhidden=wipe
  let cmd = get(a:opts, 'cmd', '')
  let autoclose = get(a:opts, 'autoclose', 1)
  if empty(cmd)
    throw 'command required!'
  endif
  let cwd = get(a:opts, 'cwd', '')
  if !empty(cwd) | execute 'lcd '.cwd | endif
  let keepfocus = get(a:opts, 'keepfocus', 0)
  let bufnr = bufnr('%')
  let Callback = get(a:opts, 'Callback', v:null)
  if has('nvim')
    call termopen(cmd, {
          \ 'on_exit': function('s:on_exit', [autoclose, bufnr, Callback]),
          \})
  else
    call term_start(cmd, {
          \ 'exit_cb': function('s:on_exit', [autoclose, bufnr, Callback]),
          \ 'curwin': 1,
          \})
  endif
  if keepfocus
    wincmd p
  endif
  return bufnr
endfunction

function! s:markdown_review_installed(status, ...) abort
  if a:status != 0
    call mdrv#util#echo_messages('Error', '[markdown-review]: install fail')
    return
  endif
  echo '[markdown-review.nvim]: install completed'
endfunction

function! s:trim(str) abort
  return substitute(a:str, '\v^(\s|\\n)*|(\s|\\n)*$', '', 'g')
endfunction

function! mdrv#util#install(...)
  let l:version = mdrv#util#pre_build_version()
  let l:info = json_decode(join(readfile(s:mdrv_root_dir . '/package.json'), ''))
  if s:trim(l:version) ==# s:trim(l:info.version)
    return
  endif
  let obj = json_decode(join(readfile(s:package_file)))
  let cmd = (mdrv#util#get_platform() ==# 'win' ? 'install.cmd' : './install.sh') . ' v'.obj['version']
  if get(a:, '1', v:false) ==# v:true
    execute 'lcd ' . s:mdrv_root_dir . '/app'
    execute '!' . cmd
  else
    call mdrv#util#open_terminal({
          \ 'cmd': cmd,
          \ 'cwd': s:mdrv_root_dir . '/app',
          \ 'Callback': function('s:markdown_review_installed')
          \})
    wincmd p
  endif
endfunction

function! mdrv#util#install_sync(...)
  if get(a:, '1', v:false) ==# v:true
    silent call mdrv#util#install(v:true)
  else
    call mdrv#util#install(v:true)
  endif
endfunction

function! mdrv#util#pre_build_version() abort
  let l:pre_build = s:pre_build . mdrv#util#get_platform()
  if has('win32') || has('win64')
    let l:pre_build .= '.exe'
  endif
  if filereadable(l:pre_build)
    let l:info = system(l:pre_build . ' --version')
    if l:info ==# ''
      call mdrv#util#echo_messages('Type', "[markdown-review.nvim]: Can not execute pre build binary bundle to get version, will download latest pre build binary bundle")
      return ''
    endif
    let l:info = split(l:info, '\n')
    return l:info[0]
  endif
  return ''
endfunction

function! mdrv#util#toggle_preview() abort
    if !get(b:, 'MarkdownReviewToggleBool')
        call mdrv#util#open_preview_page()
        let b:MarkdownReviewToggleBool=1
    else
        call mdrv#util#stop_preview()
        let b:MarkdownReviewToggleBool=0
    endif
endfunction

