# ✨ Markdown Review for (Neo)vim ✨

> Markdown preview with integrated review comments. Based on [iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim).

### Introduction

> It only works on Vim >= 8.1 and Neovim

Preview Markdown in your modern browser with synchronised scrolling and flexible configuration. Attach review comments directly to lines in the preview and have them flow into your quickfix list.

Main features:

- Cross platform (MacOS/Linux/Windows)
- Synchronised scrolling
- Fast asynchronous updates
- [KaTeX](https://github.com/Khan/KaTeX) for typesetting of math
- [PlantUML](https://github.com/plantuml/plantuml)
- [Mermaid](https://github.com/knsv/mermaid)
- [Chart.js](https://github.com/chartjs/Chart.js)
- [js-sequence-diagrams](https://github.com/bramp/js-sequence-diagrams)
- [Flowchart](https://github.com/adrai/flowchart.js)
- [dot](https://github.com/mdaines/viz.js)
- [Table of contents](https://github.com/nagaozen/markdown-it-toc-done-right)
- Emojis
- Task lists
- Local images
- Flexible configuration
- **Review comments**: attach comments to lines in the preview; they populate your quickfix list for integration with quickfix-review-nvim and other tooling

**Note** the plugin `mathjax-support-for-mkdp` is not needed for typesetting math.

![animation of Markdown Preview with its own README.md](https://user-images.githubusercontent.com/5492542/47603494-28e90000-da1f-11e8-9079-30646e551e7a.gif)

### Installation & Usage

#### With Nix (Flake)

This project includes a `flake.nix` that provides a development environment and integrates with [avi](https://github.com/antono/avi) (a nixvim configuration).

```bash
# Enter the development environment
nix develop

# Run Neovim with avi + markdown-review plugin
nix run .#default

# Build the package
nix build .#markdown-review
```

The flake includes:
- **Neovim** with avi configuration + markdown-review plugin
- **Development tools**: Node.js, yarn, TypeScript, pkg-config
- **Utilities**: git, gh CLI

#### With Vim/Neovim Plugin Managers

Install with [vim-plug](https://github.com/junegunn/vim-plug):

```vim
" If you don't have nodejs and yarn
" use pre build, add 'vim-plug' to the filetype list so vim-plug can update this plugin
" see: https://github.com/iamcco/markdown-preview.nvim/issues/50
Plug 'antono/markdown-review.nvim', { 'do': { -> mdrv#util#install() }, 'for': ['markdown'] }

" If you have nodejs
Plug 'antono/markdown-review.nvim', { 'do': 'cd app && npx --yes yarn install' }
```

Or install with [dein](https://github.com/Shougo/dein.vim):

```vim
call dein#add('antono/markdown-review.nvim', {'on_ft': ['markdown', 'pandoc.markdown', 'rmd'],
					\ 'build': 'sh -c "cd app && npx --yes yarn install"' })
```

Or with [minpac](https://github.com/k-takata/minpac):

```vim
call minpac#add('antono/markdown-review.nvim', {'do': 'packloadall! | call mdrv#util#install()'})
```

Or with [Vundle](https://github.com/vundlevim/vundle.vim):

Place this in your `.vimrc` or `init.vim`,
```vim
Plugin 'antono/markdown-review.nvim'
```
... then run the following in Vim (to complete the `Plugin` installation):
```vim
:source %
:PluginInstall
:call mdrv#util#install()
```
Or with [lazy.nvim](https://github.com/folke/lazy.nvim):

Add this in your `init.lua or plugins.lua`

```lua
-- install without yarn or npm
{
    "antono/markdown-review.nvim",
    cmd = { "MarkdownReview", "MarkdownReviewStop", "MarkdownReviewToggle" },
    ft = { "markdown" },
    build = function() vim.fn["mdrv#util#install"]() end,
}

-- install with yarn or npm
{
  "antono/markdown-review.nvim",
  cmd = { "MarkdownReview", "MarkdownReviewStop", "MarkdownReviewToggle" },
  build = "cd app && yarn install",
  init = function()
    vim.g.mdrv_filetypes = { "markdown" }
  end,
  ft = { "markdown" },
},

```
Or with [Packer.nvim](https://github.com/wbthomason/packer.nvim):

Add this in your `init.lua or plugins.lua`

```lua
use {
    'antono/markdown-review.nvim',
    run = function() vim.fn['mdrv#util#install']() end,
}

use {
  "antono/markdown-review.nvim",
  run = "cd app && npm install",
  setup = function() vim.g.mdrv_filetypes = { "markdown" } end,
}
```

### MarkdownReview Config:

these are default settings of markdown-preview, you can change them:

```vim
" set to 1, the vim will open the preview window once enter the markdown
" buffer
let g:mdrv_auto_start = 0

" set to 1, the vim will auto close current preview window when change
" from markdown buffer to another buffer
let g:mdrv_auto_close = 1

" set to 1, the vim will just refresh markdown when save the buffer or
" leave from insert mode, default 0 is auto refresh markdown as you edit or
" move the cursor
let g:mdrv_refresh_slow = 0

" set to 1, the MarkdownReview command can be used for all files,
" by default it just can be use in markdown file
let g:mdrv_command_for_global = 0

" set to 1, preview server available to others in your network
" by default, the server only listens on localhost (127.0.0.1)
let g:mdrv_open_to_the_world = 0

" use custom ip to open preview page
" default empty
let g:mdrv_open_ip = ''

" set to 1, echo preview page url in command line when open preview page
" default is 0
let g:mdrv_echo_preview_url = 0

" use custom vim function to open preview page
" this function will receive url as param
let g:mdrv_browserfunc = ''

" specify browser to open preview page
let g:mdrv_browser = ''

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
endif

" markdown css file absolute path
let g:mdrv_markdown_css = ''

" highlight css file absolute path
let g:mdrv_highlight_css = ''

let g:mdrv_port = ''

" preview page title
" ${name} will be replace with the file name
let g:mdrv_page_title = '「${name}」'

" recognized filetypes
" these filetypes will have MarkdownReview... commands
let g:mdrv_filetypes = ['markdown']

" markdown images custom path
let g:mdrv_images_path = /home/user/.markdown_images

" theme: dark or light
" By default the theme is defined by the system settings. If you want to force it always be light or dark, you can set it to 'light' or 'dark'
let g:mdrv_theme = 'dark'

" combine preview window
" in normal mode `o` key to open new window and `o` key again to close preview window.
" function! g:Mdrv_windows_quit(bufnr)
" endfunction
" let g:mdrv_combine_preview = 0
" let g:mdrv_combine_preview_auto_refresh = 1

" set to 1, enable sending review comments from the preview page to the
" quickfix list (usable by quickfix-review-nvim and any quickfix tooling).
" By default this is 1 in this fork since review is its primary purpose.
let g:mdrv_enable_review = 1

" set to 1, automatically run :copen after a review comment is added
let g:mdrv_review_auto_open = 0
```

### Preview commands:

```
:MarkdownReview

open preview (starts in review mode by default)

:MarkdownReviewStop

stop the preview

:MarkdownReviewToggle

toggle the preview
```

### Key Mappings

Mappings for `<Plug>` are:

```
<Plug>MarkdownReview
<Plug>MarkdownReviewStop
<Plug>MarkdownReviewToggle
```

To use them, add the following to your `init.vim` or `init.lua`:

```vim
nmap <C-s> <Plug>MarkdownReview
nmap <M-s> <Plug>MarkdownReviewStop
nmap <C-p> <Plug>MarkdownReviewToggle
```

or lua:

```lua
vim.keymap.set('n', '<C-s>', '<Plug>MarkdownReview', {})
vim.keymap.set('n', '<M-s>', '<Plug>MarkdownReviewStop', {})
vim.keymap.set('n', '<C-p>', '<Plug>MarkdownReviewToggle', {})
```

### Custom `mdrv_browserfunc`

If you need custom logic to open the preview page, you can define a custom `mdrv_browserfunc` that takes the url as argument. For example:

```vim
function OpenMarkdownReview (url)
    execute "silent! !firefox --new-window " . a:url . " &"
endfunction
let g:mdrv_browserfunc = 'OpenMarkdownReview'
```

or the same with `mdrv_browser` and a shell command like `firefox`:

```vim
let g:mdrv_browser = 'firefox'
```

**Note** for some people, just setting the `mdrv_browser` to your browser may not be enough.
For more details see: https://github.com/iamcco/markdown-preview.nvim/pull/9 (and related issue #199)

Examples on other platforms:

```vim
" for windows
function OpenMarkdownReview (url)
    execute "silent! !start " . shellescape(a:url)
endfunction
let g:mdrv_browserfunc = 'OpenMarkdownReview'

" for linux
function OpenMarkdownReview (url)
    execute "silent! !xdg-open " . shellescape(a:url)
endfunction
let g:mdrv_browserfunc = 'OpenMarkdownReview'

" for mac
function OpenMarkdownReview (url)
    execute "silent! !open " . shellescape(a:url)
endfunction
let g:mdrv_browserfunc = 'OpenMarkdownReview'
```

### Credits

This is a community fork of [iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim), the original markdown preview plugin for (Neo)vim. This fork adds integrated review comments that flow directly into the quickfix list, making it suitable for collaborative review and feedback workflows.

**Upstream attribution**: Special thanks to the original author [年糕小豆汤](https://github.com/iamcco) for creating the excellent markdown preview foundation.

**This fork is community-maintained** and not officially supported by the upstream project. It is distributed under the same MIT license.
