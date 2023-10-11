let s:mkdp_root_dir = expand('<sfile>:h:h:h')

function! health#mkdp#check() abort
  lua vim.health.info("Platform: " .. vim.fn['mkdp#util#get_platform']())
  lua vim.health.info('Nvim Version: ' .. string.gsub(vim.fn.system('nvim --version'), '^%s*(.-)%s*$', '%1'))
  let l:mkdp_server_script = s:mkdp_root_dir .. '/app/bin/markdown-preview-' .. mkdp#util#get_platform()
  if executable(l:mkdp_server_script)
    lua vim.health.info('Pre build: ' .. vim.api.nvim_eval('l:mkdp_server_script'))
    lua vim.health.info('Pre build version: ' .. vim.fn['mkdp#util#pre_build_version']())
    lua vim.health.ok('Using pre build')
  elseif executable('node')
    lua vim.health.info('Node version: ' .. string.gsub(vim.fn.system('node --version'), '^%s*(.-)%s*$', '%1'))
    let l:mkdp_server_script = s:mkdp_root_dir .. '/app/server.js'
    lua vim.health.info('Script: ' .. vim.api.nvim_eval('l:mkdp_server_script'))
    lua vim.health.info('Script exists: ' .. vim.fn.filereadable(vim.api.nvim_eval('l:mkdp_server_script')))
    lua vim.health.ok('Using node')
  endif
endfunction
