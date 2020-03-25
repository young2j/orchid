const {nativeImage,Tray,ipcMain,Menu} = require('electron')

let tray = null//提升为全局变量，否则可能出现托盘异常退出，被当作垃圾回收
const createTray = ()=>{
  tray = new Tray('./src/assets/orchid.ico') //注意：路径是相对与main.js而言的，只是从main.js分离出来而已
  let settingsIcon = nativeImage.createFromPath('./src/assets/settings.png')
  let recogIcon = nativeImage.createFromPath('./src/assets/camera.png')
  let exitIcon = nativeImage.createFromPath('./src/assets/exit.png')
  const menuTemplate = [
      { 
        label: '应用设置', 
        type: 'normal' ,
        icon:settingsIcon,
        click:()=>{
            ipcMain.emit('open-settings-window')
        }
      },
      { 
        label: '文字识别', 
        type: 'normal',
        icon:recogIcon,
        click:()=>{
          ipcMain.emit('open-recognition-window')
        }
    },
      {type: 'separator'},
      {label:"退出应用",role:"quit",icon:exitIcon},
    ]

  const contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setToolTip('Orchid')
  tray.setContextMenu(contextMenu)

  tray.on('click',()=>{
      ipcMain.emit('capture')
  })
}

module.exports = createTray