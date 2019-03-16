<h1 align="center"> ✨ Markdown Preview for (Neo)vim ✨ </h1>

> power by ❤️

### Introduction

> It only works on vim >= 8.1 and neovim

preview markdown on your modern browser with sync scroll and flexible configuration

main features:

- cross platform (macos/linux/windows)
- sync scroll
- fast async update
- [katex](https://github.com/Khan/KaTeX) typesetting math
- [plantuml](https://github.com/plantuml/plantuml)
- [mermaid](https://github.com/knsv/mermaid)
- [chart.js](https://github.com/chartjs/Chart.js)
- emoji
- task list
- local image
- flexible configuration

![screenshot](https://user-images.githubusercontent.com/5492542/47603494-28e90000-da1f-11e8-9079-30646e551e7a.gif)

### install & usage

install by [vim-plug](https://github.com/junegunn/vim-plug):

```vim
" if you don't have nodejs and yarn
" use pre build
Plug 'iamcco/markdown-preview.nvim', { 'do': { -> mkdp#util#install() }}

" have nodejs and yarn
Plug 'iamcco/markdown-preview.nvim', { 'do': 'cd app & yarn install'  }
```

config:

```vim
" set to 1, the nvim will open the preview window once enter the markdown buffer
" default: 0
let g:mkdp_auto_start = 0

" set to 1, the nvim will auto close current preview window when change
" from markdown buffer to another buffer
" default: 1
let g:mkdp_auto_close = 1

" set to 1, the vim will refresh markdown when save the buffer or
" leave from insert mode, default 0 is auto refresh markdown as you edit or
" move the cursor
" default: 0
let g:mkdp_refresh_slow = 0

" set to 1, the MarkdownPreview command can be use for all files,
" by default it can be use in markdown file
" default: 0
let g:mkdp_command_for_global = 0

" set to 1, preview server available to others in your network
" by default, the server listens on localhost (127.0.0.1)
" default: 0
let g:mkdp_open_to_the_world = 0

" use custom IP to open preview page
" useful when you work in remote vim and preview on local browser
" more detail see: https://github.com/iamcco/markdown-preview.nvim/pull/9
" default empty
let g:mkdp_open_ip = ''

" specify browser to open preview page
" default: ''
let g:mkdp_browser = ''

" set to 1, echo preview page url in command line when open preview page
" default is 0
let g:mkdp_echo_preview_url = 0

" a custom vim function name to open preview page
" this function will receive url as param
" default is empty
let g:mkdp_browserfunc = ''

" options for markdown render
" mkit: markdown-it options for render
" katex: katex options for math
" uml: markdown-it-plantuml options
" maid: mermaid options
" disable_sync_scroll: if disable sync scroll, default 0
" sync_scroll_type: 'middle', 'top' or 'relative', default value is 'middle'
"   middle: mean the cursor position alway show at the middle of the preview page
"   top: mean the vim top viewport alway show at the top of the preview page
"   relative: mean the cursor position alway show at the relative positon of the preview page
" hide_yaml_meta: if hide yaml metadata, default is 1
let g:mkdp_preview_options = {
    \ 'mkit': {},
    \ 'katex': {},
    \ 'uml': {},
    \ 'maid': {},
    \ 'disable_sync_scroll': 0,
    \ 'sync_scroll_type': 'middle',
    \ 'hide_yaml_meta': 1
    \ }

" use a custom markdown style must be absolute path
let g:mkdp_markdown_css = ''

" use a custom highlight style must absolute path
let g:mkdp_highlight_css = ''

" use a custom port to start server or random for empty
let g:mkdp_port = ''

" preview page title
" ${name} will be replace with the file name
let g:mkdp_page_title = '「${name}」'
```

command:

```vim
" preview
:MarkdownPreview

" stop preview"
:MarkdownPreviewStop
```

### F&Q

A: Why my sync scroll is slow reaction

B: set `updatetime` to a small number, like `set updatetime=100`

### About vim support

vim support is power by [vim-node-rpc](https://github.com/neoclide/vim-node-rpc)

> this plugin is integrate with vim-node-rpc, so you don't need to install vim-node-rpc

### reference

- [coc.nvim](https://github.com/neoclide/coc.nvim)
- [vim-node-rpc](https://github.com/neoclide/vim-node-rpc)
- [chart.js](https://github.com/chartjs/Chart.js)
- [highlight](https://github.com/highlightjs/highlight.js)
- [neovim/node-client](https://github.com/neovim/node-client)
- [next.js](https://github.com/zeit/next.js)
- [markdown.css](https://github.com/iamcco/markdown.css)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [markdown-it-katex](https://github.com/waylonflinn/markdown-it-katex)
- [markdown-it-plantuml](https://github.com/gmunguia/markdown-it-plantuml)
- [markdown-it-chart](https://github.com/tylingsoft/markdown-it-chart)
- [mermaid](https://github.com/knsv/mermaid)
- [opener](https://github.com/domenic/opener)
- [socket.io](https://github.com/socketio/socket.io)

### Buy Me A Coffee ☕️

![btc](https://img.shields.io/keybase/btc/iamcco.svg?style=popout-square)

![image](https://user-images.githubusercontent.com/5492542/42771079-962216b0-8958-11e8-81c0-520363ce1059.png)
