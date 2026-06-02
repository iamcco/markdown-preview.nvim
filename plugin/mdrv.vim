" set to 1, the vim will open the preview window once enter the markdown
" buffer
if !exists('g:mdrv_auto_start')
  let g:mdrv_auto_start = 0
endif

" let g:mdrv_auto_open = 0
" set to 1, the vim will auto open preview window when you edit the
" markdown file

" set to 1, the vim will auto close current preview window when change
" from markdown buffer to another buffer
if !exists('g:mdrv_auto_close')
  let g:mdrv_auto_close = 1
endif

" set to 1, the vim will just refresh markdown when save the buffer or
" leave from insert mode, default 0 is auto refresh markdown as you edit or
" move the cursor
if !exists('g:mdrv_refresh_slow')
  let g:mdrv_refresh_slow = 0
endif

" set to 1, the MarkdownReview command can be use for all files,
" by default it just can be use in markdown file
if !exists('g:mdrv_command_for_global')
  let g:mdrv_command_for_global = 0
endif

" set to 1, preview server available to others in your network
" by default, the server only listens on localhost (127.0.0.1)
if !exists('g:mdrv_open_to_the_world')
  let g:mdrv_open_to_the_world = 0
endif

" use custom ip to open preview page
" default empty
if !exists('g:mdrv_open_ip')
  let g:mdrv_open_ip = ''
endif

" set to 1, echo preview page url in command line when open preview page
" default is 0
if !exists('g:mdrv_echo_preview_url')
  let g:mdrv_echo_preview_url = 0
endif

" use custom vim function to open preview page
" this function will receive url as param
if !exists('g:mdrv_browserfunc')
  let g:mdrv_browserfunc = ''
endif

" specify browser to open preview page
if !exists('g:mdrv_browser')
  let g:mdrv_browser = ''
endif

if !exists('g:mdrv_preview_options')
  let g:mdrv_preview_options = {
      \ 'mkit': {},
      \ 'katex': {},
      \ 'uml': {},
      \ 'maid': {},
      \ 'disable_sync_scroll': 0,
      \ 'sync_scroll_type': 'middle',
      \ 'hide_yaml_meta': 1,
      \ 'sequence_diagrams': {},
      \ 'flowchart_diagrams': {},
      \ 'content_editable': v:false,
      \ 'disable_filename': 0,
      \ 'toc': {}
      \ }
elseif !has_key(g:mdrv_preview_options, 'disable_filename')
  let g:mdrv_preview_options['disable_filename'] = 0
endif

" markdown css file absolute path
if !exists('g:mdrv_markdown_css')
  let g:mdrv_markdown_css = ''
endif

" highlight css file absolute path
if !exists('g:mdrv_highlight_css')
  let g:mdrv_highlight_css = ''
endif

if !exists('g:mdrv_port')
  let g:mdrv_port = ''
endif

" preview page title
" ${name} will be replace with the file name
if !exists('g:mdrv_page_title')
  let g:mdrv_page_title = '「${name}」'
endif

" recognized filetypes
if !exists('g:mdrv_filetypes')
  let g:mdrv_filetypes = ['markdown']
endif

" markdown images custom path
if !exists('g:mdrv_images_path')
  let g:mdrv_images_path = ''
endif

" combine preview window
if !exists('g:mdrv_combine_preview')
  let g:mdrv_combine_preview = 0
endif

" auto refetch combine preview contents when change markdown buffer
" only when g:mdrv_combine_preview is 1
if !exists('g:mdrv_combine_preview_auto_refresh')
  let g:mdrv_combine_preview_auto_refresh = 1
endif

" set to 1, enable sending review comments from the preview page to the
" quickfix list (usable by quickfix-review-nvim and any quickfix tooling).
" Defaults to 1 because review is this fork's reason for existing.
if !exists('g:mdrv_enable_review')
  let g:mdrv_enable_review = 1
endif

" set to 1, automatically run :copen after a review comment is added
if !exists('g:mdrv_review_auto_open')
  let g:mdrv_review_auto_open = 0
endif

" if there are any active preview client
let g:mdrv_clients_active = 0

function! s:init_command() abort
  command! -buffer MarkdownReview call mdrv#review#open()
  command! -buffer MarkdownReviewStop call mdrv#util#stop_preview()
  command! -buffer MarkdownReviewToggle call mdrv#util#toggle_preview()
  " mapping for user
  noremap <buffer> <silent> <Plug>MarkdownReview :MarkdownReview<CR>
  inoremap <buffer> <silent> <Plug>MarkdownReview <Esc>:MarkdownReview<CR>a
  noremap <buffer> <silent> <Plug>MarkdownReviewStop :MarkdownReviewStop<CR>
  inoremap <buffer> <silent> <Plug>MarkdownReviewStop <Esc>:MarkdownReviewStop<CR>a
  nnoremap <buffer> <silent> <Plug>MarkdownReviewToggle :MarkdownReviewToggle<CR>
  inoremap <buffer> <silent> <Plug>MarkdownReviewToggle <Esc>:MarkdownReviewToggle<CR>
endfunction

function! s:init() abort
  augroup mdrv_init
    autocmd!
    if g:mdrv_command_for_global
      autocmd BufEnter * :call s:init_command()
    else
      autocmd BufEnter,FileType * if index(g:mdrv_filetypes, &filetype) !=# -1 | call s:init_command() | endif
    endif
    if g:mdrv_auto_start
      execute 'autocmd BufEnter *.{md,mkd,mdown,mkdn,mdwn,' . join(g:mdrv_filetypes, ',') . '} call mdrv#review#open()'
    endif
    if g:mdrv_combine_preview && g:mdrv_combine_preview_auto_refresh
      execute 'autocmd BufEnter *.{md,mkd,mdown,mkdn,mdwn,' . join(g:mdrv_filetypes, ',') . '} call mdrv#util#combine_preview_refresh()'
    endif
  augroup END
endfunction

call s:init()
