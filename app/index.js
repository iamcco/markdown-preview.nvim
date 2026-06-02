// change cwd to ./app
if (!/^(\/|C:\\)snapshot/.test(__dirname)) {
  process.chdir(__dirname)
} else {
  process.chdir(process.execPath.replace(/(markdown-review.nvim.*?app).+?$/, '$1'))
}

require('./lib/app')
