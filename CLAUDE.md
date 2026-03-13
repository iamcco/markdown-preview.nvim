# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`markdown-preview.nvim` is a Neovim/Vim plugin for previewing Markdown in a browser with synchronized scrolling. It supports KaTeX, PlantUML, Mermaid, Chart.js, flowcharts, sequence diagrams, and more.

## Build Commands

```bash
# Install dependencies (in app/ directory)
cd app && yarn install

# Build TypeScript to app/lib/
yarn build-lib

# Build Next.js frontend (outputs to app/out/)
yarn build-app

# Full build for release (includes pre-built binaries)
yarn build
```

## Architecture

### Three-Layer Architecture

1. **VimScript Layer** (`plugin/`, `autoload/`)
   - Entry point for Neovim/Vim commands
   - RPC communication with Node.js server via job control
   - Key files: `autoload/mkdp/rpc.vim`, `autoload/mkdp/util.vim`

2. **Node.js Server** (`app/server.js`, `src/attach/`)
   - HTTP + WebSocket (socket.io) server
   - Attaches to Neovim via `@chemzqm/neovim` using msgpack RPC
   - Routes: `/page/:bufnr` for preview pages, `/_static/` for assets
   - Entry: `app/index.js` → `src/app/load.ts` → `app/server.js`

3. **Browser Frontend** (`app/pages/`)
   - React/Next.js application with markdown-it rendering
   - WebSocket client receives content updates from server
   - Main component: `pages/index.jsx`

### Communication Flow

```
Neovim (VimScript) <--RPC--> Node.js Server <--WebSocket--> Browser
     |                              |                              |
  commands                    markdown content              rendered HTML
  autocmds                    buffer updates                mermaid/katex
```

### Key Files

| File | Purpose |
|------|---------|
| `plugin/mkdp.vim` | Command definitions, mappings, config defaults |
| `autoload/mkdp/rpc.vim` | RPC client for Neovim/Vim job communication |
| `src/attach/index.ts` | Neovim msgpack attachment handler |
| `app/server.js` | HTTP + WebSocket server, event handlers |
| `app/pages/index.jsx` | React preview page with markdown-it |

### Markdown Rendering Pipeline

`app/pages/index.jsx` configures markdown-it with plugins:
- KaTeX (math)
- PlantUML (diagrams via `pages/blockPlantuml.js`, `pages/plantuml.js`)
- Mermaid (diagrams)
- Chart.js, flowchart.js, viz.js (dot)
- TOC, footnotes, task lists, emoji

## Configuration

Configuration is via Vim global variables (see `plugin/mkdp.vim`):
- `g:mkdp_auto_start`, `g:mkdp_auto_close`, `g:mkdp_refresh_slow`
- `g:mkdp_preview_options` (mkit, katex, uml, maid options)
- `g:mkdp_port`, `g:mkdp_browser`, `g:mkdp_theme`

## Development Notes

- TypeScript source in `src/` compiles to `app/lib/`
- Frontend uses Next.js static export (`app/out/`)
- Pre-built binaries downloaded from GitHub releases for users without Node.js
- Install script (`app/install.sh`) downloads platform-specific binary
