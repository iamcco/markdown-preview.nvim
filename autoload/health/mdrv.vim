let s:mdrv_root_dir = expand('<sfile>:h:h:h')

function! health#mdrv#check() abort
  lua vim.health.info("Platform: " .. vim.fn['mdrv#util#get_platform']())
  lua vim.health.info('Nvim Version: ' .. string.gsub(vim.fn.system('nvim --version'), '^%s*(.-)%s*$', '%1'))
  let l:mdrv_server_script = s:mdrv_root_dir .. '/app/bin/markdown-preview-' .. mdrv#util#get_platform()
  if executable(l:mdrv_server_script)
    lua vim.health.info('Pre build: ' .. vim.api.nvim_eval('l:mdrv_server_script'))
    lua vim.health.info('Pre build version: ' .. vim.fn['mdrv#util#pre_build_version']())
    lua vim.health.ok('Using pre build')
  elseif executable('node')
    lua vim.health.info('Node version: ' .. string.gsub(vim.fn.system('node --version'), '^%s*(.-)%s*$', '%1'))
    let l:mdrv_server_script = s:mdrv_root_dir .. '/app/server.js'
    lua vim.health.info('Script: ' .. vim.api.nvim_eval('l:mdrv_server_script'))
    lua vim.health.info('Script exists: ' .. vim.fn.filereadable(vim.api.nvim_eval('l:mdrv_server_script')))
    lua vim.health.ok('Using node')
  endif
endfunction
