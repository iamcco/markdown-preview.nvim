" set to 1, the vim will open the preview window once enter the markdown
" buffer
if !exists('g:mkdp_auto_start')
  let g:mkdp_auto_start = 0
endif

" let g:mkdp_auto_open = 0
" set to 1, the vim will auto open preview window when you edit the
" markdown file

" set to 1, the vim will auto close current preview window when change
" from markdown buffer to another buffer
if !exists('g:mkdp_auto_close')
  let g:mkdp_auto_close = 1
endif

" set to 1, the vim will just refresh markdown when save the buffer or
" leave from insert mode, default 0 is auto refresh markdown as you edit or
" move the cursor
if !exists('g:mkdp_refresh_slow')
  let g:mkdp_refresh_slow = 0
endif

" set to 1, the MarkdownPreview command can be use for all files,
" by default it just can be use in markdown file
if !exists('g:mkdp_command_for_global')
  let g:mkdp_command_for_global = 0
endif

" set to 1, preview server available to others in your network
" by default, the server only listens on localhost (127.0.0.1)
if !exists('g:mkdp_open_to_the_world')
  let g:mkdp_open_to_the_world = 0
endif

" use custom ip to open preview page
" default empty
if !exists('g:mkdp_open_ip')
  let g:mkdp_open_ip = ''
endif

" set to 1, echo preview page url in command line when open preview page
" default is 0
if !exists('g:mkdp_echo_preview_url')
  let g:mkdp_echo_preview_url = 0
endif

" use custom vim function to open preview page
" this function will receive url as param
if !exists('g:mkdp_browserfunc')
  let g:mkdp_browserfunc = ''
endif

" specify browser to open preview page
if !exists('g:mkdp_browser')
  let g:mkdp_browser = ''
endif

if !exists('g:mkdp_preview_options')
  let g:mkdp_preview_options = {
      \ 'mkit': {},
      \ 'katex': {},
      \ 'uml': {},
      \ 'maid': {},
      \ 'disable_sync_scroll': 0,
      \ 'sync_scroll_type': 'middle',
      \ 'hide_yaml_meta': 1,
      \ 'sequence_diagrams': {}
      \ }
endif

" markdown css file absolute path
if !exists('g:mkdp_markdown_css')
  let g:mkdp_markdown_css = ''
endif

" highlight css file absolute path
if !exists('g:mkdp_highlight_css')
  let g:mkdp_highlight_css = ''
endif

if !exists('g:mkdp_port')
  let g:mkdp_port = ''
endif

" preview page title
" ${name} will be replace with the file name
if !exists('g:mkdp_page_title')
  let g:mkdp_page_title = '「${name}」'
endif

function! s:init_command() abort
  " mapping for user
  noremap <buffer> <silent> <Plug>MarkdownPreview :call mkdp#util#open_preview_page()<CR>
  inoremap <buffer> <silent> <Plug>MarkdownPreview <Esc>:call mkdp#util#open_preview_page()<CR>a
  noremap <buffer> <silent> <Plug>MarkdownPreviewStop :call mkdp#util#stop_preview()<CR>
  inoremap <buffer> <silent> <Plug>MarkdownPreviewStop <Esc>:call mkdp#util#stop_preview()<CR>a
  nnoremap <buffer> <silent> <Plug>MarkdownPreviewToggle :call mkdp#util#toggle_preview()<CR>
  inoremap <buffer> <silent> <Plug>MarkdownPreviewToggle <Esc>:call mkdp#util#toggle_preview()<CR>
endfunction

function! s:MkdpAU() abort
    command! -buffer MarkdownPreview call mkdp#util#open_preview_page()
    call s:init_command()
endfunction

function! s:init() abort
  if g:mkdp_command_for_global
    au BufEnter * :call s:MkdpAU()
  else
    au BufEnter *.{md,mkd,markdown,mdown,mkdn,mdwn} :call s:MkdpAU()
  endif
  if g:mkdp_auto_start
    au BufEnter *.{md,mkd,markdown,mdown,mkdn,mdwn} call mkdp#util#open_preview_page()
  endif
endfunction

call s:init()
