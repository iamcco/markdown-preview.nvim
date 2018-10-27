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

if !exists('g:mkdp_preview_options')
  let g:mkdp_preview_options = {
      \ 'mkit': {},
      \ 'katex': {},
      \ 'uml': {}
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

function! s:init_command() abort
  " mapping for user
  map <buffer> <silent> <Plug>MarkdownPreview :call mkdp#util#open_preview_page()<CR>
  imap <buffer> <silent> <Plug>MarkdownPreview <Esc>:call mkdp#util#open_preview_page()<CR>a
  map <buffer> <silent> <Plug>MarkdownPreviewStop :call mkdp#util#stop_preview()<CR>
  imap <buffer> <silent> <Plug>MarkdownPreviewStop <Esc>:call mkdp#util#stop_preview()<CR>a
endfunction

function! s:init() abort
  if g:mkdp_command_for_global
    au BufEnter * command! -buffer MarkdownPreview call mkdp#util#open_preview_page()
    call s:init_command()
  else
    au BufEnter *.{md,mkd,markdown,mdown,mkdn,mdwn} command! -buffer MarkdownPreview call mkdp#util#open_preview_page()
    call s:init_command()
  endif
  if g:mkdp_auto_start
    au BufEnter *.{md,mkd,markdown,mdown,mkdn,mdwn} call mkdp#util#open_preview_page()
  endif
endfunction

call s:init()
