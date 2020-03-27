const {nativeImage,Tray,ipcMain,Menu} = require('electron')
const path = require('path')

let tray = null//提升为全局变量，否则可能出现托盘异常退出，被当作垃圾回收
const createTray = ()=>{
  // tray = new Tray(path.join(__dirname,'./mainProcess/assets/images/orchid.ico')) //注意：开发环境下路径是相对于main.js而言的绝对路径，只是从main.js分离出来而已
  // let settingsIcon = nativeImage.createFromPath(path.join(__dirname,'./mainProcess/assets/images/settings.png'))
  // let recogIcon = nativeImage.createFromPath(path.join(__dirname,'./mainProcess/assets/images/camera.png'))
  // let exitIcon = nativeImage.createFromPath(path.join(__dirname,'./mainProcess/assets/images/exit.png'))
  let ico = process.platform==='win32'
  ? path.join(__dirname,'./assets/images/orchid.ico')
  : path.join(__dirname,'./assets/images/orchid.png')
  tray = new Tray(ico) //注意：打包时路径就是自己的绝对路径。
  let settingsIcon = nativeImage.createFromPath(path.join(__dirname,'./assets/images/settings.png'))
  // let recogIcon = nativeImage.createFromPath(path.join(__dirname,'./assets/images/camera.png'))
  let exitIcon = nativeImage.createFromPath(path.join(__dirname,'./assets/images/exit.png'))
  const menuTemplate = [
      {
        label: '应用设置',
        type: 'normal' ,
        icon:settingsIcon,
        click:()=>{
            ipcMain.emit('open-settings-window')
        }
      },
      // {
      //   label: '文字识别',
      //   type: 'normal',
      //   icon:recogIcon,
      //   click:()=>{
      //     ipcMain.emit('open-recognition-window')
      //   }
      // },
        {type: 'separator'},
        {label:"退出应用",role:"quit",icon:exitIcon},
    ]

  const contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setToolTip('Orchid')
  tray.setContextMenu(contextMenu)

  if(process.platform==='win32'){//linux单击出现的是右键菜单
    tray.on('click',()=>{
      ipcMain.emit('capture')
    })
  }
}

module.exports = createTray
