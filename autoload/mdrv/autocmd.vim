" init preview key action
function! mdrv#autocmd#init() abort
  execute 'augroup MDRV_REFRESH_INIT' . bufnr('%')
    autocmd!
    " refresh autocmd
    if g:mdrv_refresh_slow
      autocmd CursorHold,BufWrite,InsertLeave <buffer> call mdrv#rpc#preview_refresh()
    else
      autocmd CursorHold,CursorHoldI,CursorMoved,CursorMovedI <buffer> call mdrv#rpc#preview_refresh()
    endif
    " autoclose autocmd
    if g:mdrv_auto_close
      autocmd BufHidden <buffer> call mdrv#rpc#preview_close()
    endif
    " server close autocmd
    autocmd VimLeave * call mdrv#rpc#stop_server()
  augroup END
endfunction

function! mdrv#autocmd#clear_buf() abort
  execute 'autocmd! ' . 'MDRV_REFRESH_INIT' . bufnr('%')
endfunction
