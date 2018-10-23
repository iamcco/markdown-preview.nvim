function! mkdp#command#init() abort
  command! -buffer MarkdownPreviewStop call mkdp#util#stop_preview()
endfunction
