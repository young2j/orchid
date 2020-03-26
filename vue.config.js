/**
 * 将electron主进程文件命名为main.js，所以vue入口文件改名为App.js
 */
module.exports = {
  configureWebpack: {
    entry: './src/App.js',
    target: 'electron-renderer',
    node:{
      __dirname:false
    },
  },
  publicPath:'./' //Failed to load resource: net::ERR_FILE_NOT_FOUND
}