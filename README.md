<h1 align="center"> ✨ Markdown Preview for Neovim ✨ </h1>

> power by ❤️

### Introduction

preview markdown on your modern browser with sync scroll and flexible configuration

main features:

- cross platform (macos/linux/windows)
- sync scroll
- fast async update
- typesetting math
- plantuml
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

" set to 1, the vim will just refresh markdown when save the buffer or
" leave from insert mode, default 0 is auto refresh markdown as you edit or
" move the cursor
" default: 0
let g:mkdp_refresh_slow = 0

" set to 1, the MarkdownPreview command can be use for all files,
" by default it just can be use in markdown file
" default: 0
let g:mkdp_command_for_global = 0

" set to 1, preview server available to others in your network
" by default, the server only listens on localhost (127.0.0.1)
" default: 0
let g:mkdp_open_to_the_world = 0

" options for markdown render
" mkit: markdown-it options for render
" katex: katex options for math
" uml: markdown-it-plantuml options
let g:mkdp_preview_options = {
    \ 'mkit': {},
    \ 'katex': {},
    \ 'uml': {}
    \ }

" use a custom markdown style must be absolute path
let g:mkdp_markdown_css = ''

" use a custom highlight style must absolute path
let g:mkdp_highlight_css = ''

" use a custom port to start server or random for empty
let g:mkdp_port = ''
```

command:

```vim
" preview
:MarkdownPreview

" stop preview"
:MarkdownPreviewStop
```

### reference

- [coc.nvim](https://github.com/neoclide/coc.nvim)
- [highlight](https://github.com/highlightjs/highlight.js)
- [neovim/node-client](https://github.com/neovim/node-client)
- [next.js](https://github.com/zeit/next.js)
- [markdown.css](https://github.com/iamcco/markdown.css)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [markdown-it-katex](https://github.com/waylonflinn/markdown-it-katex)
- [markdown-it-plantuml](https://github.com/gmunguia/markdown-it-plantuml)
- [opener](https://github.com/domenic/opener)
- [socket.io](https://github.com/socketio/socket.io)

### Buy Me A Coffee ☕️

![image](https://user-images.githubusercontent.com/5492542/42771079-962216b0-8958-11e8-81c0-520363ce1059.png)
