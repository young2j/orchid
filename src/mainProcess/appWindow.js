const {BrowserWindow} = require('electron')

class AppWindow extends BrowserWindow{
  constructor(customConfig,path){
    const basicConfig = {
      width:800,
      height:600,
      webPreferences:{
        nodeIntegration:true
      },
      show:false
    }
    const config = {...basicConfig,...customConfig}
    super(config)
    const isURL = path.startsWith('http') || path.startsWith('file')
    isURL? this.loadURL(path) : this.loadFile(path)
    this.once('ready-to-show',()=>{
      this.show()
    })
    this.on('close',()=>{
      this.destroy()
    })
  }
}

module.exports = AppWindow