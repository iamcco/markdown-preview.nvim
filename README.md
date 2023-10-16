<h1 align="center"> ✨ Markdown Preview for (Neo)vim ✨ </h1>

> Powered by ❤️

### Introduction

> It only works on Vim >= 8.1 and Neovim

Preview Markdown in your modern browser with synchronised scrolling and flexible configuration.

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

**Note** the plugin `mathjax-support-for-mkdp` is not needed for typesetting math.

![animation of Markdown Preview with its own README.md](https://user-images.githubusercontent.com/5492542/47603494-28e90000-da1f-11e8-9079-30646e551e7a.gif)

### Installation & Usage

Install with [vim-plug](https://github.com/junegunn/vim-plug):

```vim
" If you don't have nodejs and yarn
" use pre build, add 'vim-plug' to the filetype list so vim-plug can update this plugin
" see: https://github.com/iamcco/markdown-preview.nvim/issues/50
Plug 'iamcco/markdown-preview.nvim', { 'do': { -> mkdp#util#install() }, 'for': ['markdown', 'vim-plug']}


" If you have nodejs
Plug 'iamcco/markdown-preview.nvim', { 'do': 'cd app && npx --yes yarn install' }
```

Or install with [dein](https://github.com/Shougo/dein.vim):

```vim
call dein#add('iamcco/markdown-preview.nvim', {'on_ft': ['markdown', 'pandoc.markdown', 'rmd'],
					\ 'build': 'sh -c "cd app && npx --yes yarn install"' })
```

Or with [minpac](https://github.com/k-takata/minpac):

```vim
call minpac#add('iamcco/markdown-preview.nvim', {'do': 'packloadall! | call mkdp#util#install()'})
```

Or with [Vundle](https://github.com/vundlevim/vundle.vim):

Place this in your `.vimrc` or `init.vim`,
```vim
Plugin 'iamcco/markdown-preview.nvim'
```
... then run the following in Vim (to complete the `Plugin` installation):
```vim
:source %
:PluginInstall
:call mkdp#util#install()
```
Or with [lazy.nvim](https://github.com/folke/lazy.nvim):

Add this in your `init.lua or plugins.lua`

```lua
-- install without yarn or npm
{
    "iamcco/markdown-preview.nvim",
    cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
    ft = { "markdown" },
    build = function() vim.fn["mkdp#util#install"]() end,
}

-- install with yarn or npm
{
  "iamcco/markdown-preview.nvim",
  cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
  build = "cd app && yarn install",
  init = function()
    vim.g.mkdp_filetypes = { "markdown" }
  end,
  ft = { "markdown" },
},

```
Or with [Packer.nvim](https://github.com/wbthomason/packer.nvim):

Add this in your `init.lua or plugins.lua`

```lua
-- install without yarn or npm
use({
    "iamcco/markdown-preview.nvim",
    run = function() vim.fn["mkdp#util#install"]() end,
})

use({ "iamcco/markdown-preview.nvim", run = "cd app && npm install", setup = function() vim.g.mkdp_filetypes = { "markdown" } end, ft = { "markdown" }, })
```

Or by hand:

```vim
use {'iamcco/markdown-preview.nvim'}
```

add plugin to the `~/.local/share/nvim/site/pack/packer/start/` directory:

```vim
cd ~/.local/share/nvim/site/pack/packer/start/
git clone https://github.com/iamcco/markdown-preview.nvim.git
cd markdown-preview.nvim
npx --yes yarn install
npx --yes yarn build
```

Please make sure that you have installed `node.js` and `yarn`.
Open `nvim` and run `:PackerInstall` to make it workable

### MarkdownPreview Config:

```vim
" set to 1, nvim will open the preview window after entering the Markdown buffer
" default: 0
let g:mkdp_auto_start = 0

" set to 1, the nvim will auto close current preview window when changing
" from Markdown buffer to another buffer
" default: 1
let g:mkdp_auto_close = 1

" set to 1, Vim will refresh Markdown when saving the buffer or
" when leaving insert mode. Default 0 is auto-refresh Markdown as you edit or
" move the cursor
" default: 0
let g:mkdp_refresh_slow = 0

" set to 1, the MarkdownPreview command can be used for all files,
" by default it can be use in Markdown files only
" default: 0
let g:mkdp_command_for_global = 0

" set to 1, the preview server is available to others in your network.
" By default, the server listens on localhost (127.0.0.1)
" default: 0
let g:mkdp_open_to_the_world = 0

" use custom IP to open preview page.
" Useful when you work in remote Vim and preview on local browser.
" For more details see: https://github.com/iamcco/markdown-preview.nvim/pull/9
" default empty
let g:mkdp_open_ip = ''

" specify browser to open preview page
" for path with space
" valid: `/path/with\ space/xxx`
" invalid: `/path/with\\ space/xxx`
" default: ''
let g:mkdp_browser = ''

" set to 1, echo preview page URL in command line when opening preview page
" default is 0
let g:mkdp_echo_preview_url = 0

" a custom Vim function name to open preview page
" this function will receive URL as param
" default is empty
let g:mkdp_browserfunc = ''

" options for Markdown rendering
" mkit: markdown-it options for rendering
" katex: KaTeX options for math
" uml: markdown-it-plantuml options
" maid: mermaid options
" disable_sync_scroll: whether to disable sync scroll, default 0
" sync_scroll_type: 'middle', 'top' or 'relative', default value is 'middle'
"   middle: means the cursor position is always at the middle of the preview page
"   top: means the Vim top viewport always shows up at the top of the preview page
"   relative: means the cursor position is always at relative positon of the preview page
" hide_yaml_meta: whether to hide YAML metadata, default is 1
" sequence_diagrams: js-sequence-diagrams options
" content_editable: if enable content editable for preview page, default: v:false
" disable_filename: if disable filename header for preview page, default: 0
let g:mkdp_preview_options = {
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

" use a custom Markdown style. Must be an absolute path
" like '/Users/username/markdown.css' or expand('~/markdown.css')
let g:mkdp_markdown_css = ''

" use a custom highlight style. Must be an absolute path
" like '/Users/username/highlight.css' or expand('~/highlight.css')
let g:mkdp_highlight_css = ''

" use a custom port to start server or empty for random
let g:mkdp_port = ''

" preview page title
" ${name} will be replace with the file name
let g:mkdp_page_title = '「${name}」'

" use a custom location for images
let g:mkdp_images_path = /home/user/.markdown_images

" recognized filetypes
" these filetypes will have MarkdownPreview... commands
let g:mkdp_filetypes = ['markdown']

" set default theme (dark or light)
" By default the theme is defined according to the preferences of the system
let g:mkdp_theme = 'dark'

" combine preview window
" default: 0
" if enable it will reuse previous opened preview window when you preview markdown file.
" ensure to set let g:mkdp_auto_close = 0 if you have enable this option
let g:mkdp_combine_preview = 0

" auto refetch combine preview contents when change markdown buffer
" only when g:mkdp_combine_preview is 1
let g:mkdp_combine_preview_auto_refresh = 1
```

Mappings:

```vim
" normal/insert
<Plug>MarkdownPreview
<Plug>MarkdownPreviewStop
<Plug>MarkdownPreviewToggle

" example
nmap <C-s> <Plug>MarkdownPreview
nmap <M-s> <Plug>MarkdownPreviewStop
nmap <C-p> <Plug>MarkdownPreviewToggle
```

Commands:

```vim
" Start the preview
:MarkdownPreview

" Stop the preview"
:MarkdownPreviewStop
```

### Custom Examples

**Table of contents**

> one of

    ${toc}
    [[toc]]
    [toc]
    [[_toc_]]

**Image Size:**

``` markdown
![image](https://user-images.githubusercontent.com/5492542/47603494-28e90000-da1f-11e8-9079-30646e551e7a.gif =400x200)
```

**PlantUML:**

    @startuml
    Bob -> Alice : hello
    @enduml

Or

    ``` plantuml
    Bob -> Alice : hello
    ```

**KaTeX:**

    $\sqrt{3x-1}+(1+x)^2$

    $$\begin{array}{c}

    \nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &
    = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\

    \nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\

    \nabla \cdot \vec{\mathbf{B}} & = 0

    \end{array}$$

**mermaid:**

    ``` mermaid
    gantt
        dateFormat DD-MM-YYY
        axisFormat %m/%y

        title Example
        section example section
        activity :active, 01-02-2019, 03-08-2019
    ```

**js-sequence-diagrams:**

    ``` sequence-diagrams
    Andrew->China: Says
    Note right of China: China thinks\nabout it
    China-->Andrew: How are you?
    Andrew->>China: I am good thanks!
    ```
**Flowchart:**

    ``` flowchart
    st=>start: Start|past:>http://www.google.com[blank]
    e=>end: End|future:>http://www.google.com
    op1=>operation: My Operation|past
    op2=>operation: Stuff|current
    sub1=>subroutine: My Subroutine|invalid
    cond=>condition: Yes
    or No?|approved:>http://www.google.com
    c2=>condition: Good idea|rejected
    io=>inputoutput: catch something...|future

    st->op1(right)->cond
    cond(yes, right)->c2
    cond(no)->sub1(left)->op1
    c2(yes)->io->e
    c2(no)->op2->e
    ```

**dot:**

    ``` dot
    digraph G {

      subgraph cluster_0 {
        style=filled;
        color=lightgrey;
        node [style=filled,color=white];
        a0 -> a1 -> a2 -> a3;
        label = "process #1";
      }

      subgraph cluster_1 {
        node [style=filled];
        b0 -> b1 -> b2 -> b3;
        label = "process #2";
        color=blue
      }
      start -> a0;
      start -> b0;
      a1 -> b3;
      b2 -> a3;
      a3 -> a0;
      a3 -> end;
      b3 -> end;

      start [shape=Mdiamond];
      end [shape=Msquare];
    }
    ```

**chart:**

    ``` chart
    {
      "type": "pie",
      "data": {
        "labels": [
          "Red",
          "Blue",
          "Yellow"
        ],
        "datasets": [
          {
            "data": [
              300,
              50,
              100
            ],
            "backgroundColor": [
              "#FF6384",
              "#36A2EB",
              "#FFCE56"
            ],
            "hoverBackgroundColor": [
              "#FF6384",
              "#36A2EB",
              "#FFCE56"
            ]
          }
        ]
      },
      "options": {}
    }
    ```

### FAQ

#### *Why is the synchronised scrolling lagging?*

Set `updatetime` to a small number, for instance: `set updatetime=100`

*WSL 2 issue*: Can not open browser when using WSL 2 with terminal Vim.

> if you are using Ubuntu you can install xdg-utils using `sudo apt-get install -y xdg-utils`
> checkout [issue 199](https://github.com/iamcco/markdown-preview.nvim/issues/199) for more detail.

#### *How can I change the dark/light theme?*

The default theme is based on your system preferences.
There is a button hidden in the header to change the theme. Place your mouse over the header to reveal it.

#### *How can I pass CLI options to the browser, like opening in a new window?*

Answer: Add the following to your Neovim init script:

*Linux*
```vimscript
  function OpenMarkdownPreview (url)
    execute "silent ! firefox --new-window " . a:url
  endfunction
  let g:mkdp_browserfunc = 'OpenMarkdownPreview'
```
Replace `firefox` with `chrome` if you prefer. Both browsers recognize the `--new-window` option.

*macOS*
```vimscript
  function OpenMarkdownPreview (url)
    execute "silent ! open -a Firefox -n --args --new-window " . a:url
  endfunction
  let g:mkdp_browserfunc = 'OpenMarkdownPreview'
```
Replace `Firefox` with `Google\ Chrome` or `Brave\ Browser` if you prefer. They all recognize the `--new-window` option.

### About Vim Support

Vim support is powered by [@chemzqm/neovim](https://github.com/neoclide/neovim)

### References

- [coc.nvim](https://github.com/neoclide/coc.nvim)
- [@chemzqm/neovim](https://github.com/neoclide/neovim)
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
- [sequence-diagrams](https://github.com/bramp/js-sequence-diagrams)
- [socket.io](https://github.com/socketio/socket.io)

### Buy Me A Coffee ☕️

![btc](https://img.shields.io/keybase/btc/iamcco.svg?style=popout-square)

![WeChat and AliPay](https://user-images.githubusercontent.com/5492542/42771079-962216b0-8958-11e8-81c0-520363ce1059.png)
