" init preview key action
function! mkdp#autocmd#init() abort
  let s:bufnum = bufnr('%')
  execute 'augroup MKDP_REFRESH_INIT' . s:bufnum
    autocmd!
    " refresh autocmd
    if g:mkdp_refresh_slow
      autocmd CursorHold,BufWrite,InsertLeave <buffer> call mkdp#rpc#preview_refresh()
    else
      autocmd CursorHold,CursorHoldI,CursorMoved,CursorMovedI <buffer> call mkdp#rpc#preview_refresh()
    endif
    " autoclose autocmd
    if g:mkdp_auto_close
      autocmd BufHidden <buffer> call mkdp#rpc#preview_close(s:bufnum)
    endif
    " server close autocmd
    autocmd VimLeave * call mkdp#rpc#stop_server()
  augroup END
endfunction

function! mkdp#autocmd#clear_buf(bufnum) abort
  execute 'autocmd! ' . 'MKDP_REFRESH_INIT' . a:bufnum
endfunction
