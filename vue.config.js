/**
 * 将electron主进程文件命名为main.js，所以vue入口文件改名为App.js
 */
module.exports = {
    configureWebpack:{
        entry:'./src/App.js'
    }
}