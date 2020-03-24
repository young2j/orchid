const { app, screen,ipcMain,nativeImage,globalShortcut } = require('electron')
const path = require('path')

const AppWindow = require('./src/mainProcess/appWindow')
const createTray = require('./src/mainProcess/appTray')
const Store = require('electron-store')

const store = new Store({name:'settings'})

app.on('ready', () => {
    // require('devtron').install()
    //-------------------------------
    //主窗口
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    // console.log(width,height);
    
    const mainWindowConfig = {
        // width: 1600,
        // height: 800,
        width,
        height,
        resizable: false,
        movable: false,
        frame:false,
        transparent: true,
        // backgroundColor:"#000000",//windwos
        // opacity: 0.3, //windows
        fullscreen: true,
        alwaysOnTop:true,
        skipTaskbar:true,
        hasShadow: false,
        webSecurity:false,
        show:false
    }
    // const mainPath = "http://localhost:8080"
    const mainPath = path.join(__dirname,'./dist/index.html')
    let mainWindow = new AppWindow(mainWindowConfig, mainPath)
    
    //--------------
    // mainWindow.webContents.openDevTools()
    
    //------------------------------
    // 托盘图标和右键菜单
    createTray()
    //处理托盘点击事件
    ipcMain.on('capture',()=>{
      // mainWindow.reload()
      mainWindow.webContents.send('flushDesktopCapture')
      mainWindow.show()
    })


    //---------------
    //设置窗口
    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 450,
            height: 300,
            icon:nativeImage.createFromPath('./src/assets/settings.png'),
            title:'应用设置',
            resizable:false,
        }
        const settingsURL = `file://${path.join(__dirname, './src/mainProcess/settingsWindow.html')}`
        const settingsWindow = new AppWindow(settingsWindowConfig, settingsURL)
        settingsWindow.setMenu(null)
        //-----------
        //重启使设置生效
        settingsWindow.on('close',()=>{
            app.relaunch()
        })
    })
    
    //-------------
    //设置开机是否自启动
    ipcMain.on('set-autostart',(event,{autostart})=>{
        const exeName = path.basename(process.execPath)
        app.setLoginItemSettings({
            openAtLogin: autostart, //boolean
            openAsHidden:false,
            path: process.execPath,
            args: [
                '--processStart', `"${exeName}"`,
                ]
            })
        }
    )


    //--------------
    //全局快捷键
    let quickKey = store.get('quickKey') || 'F1'
    globalShortcut.register(quickKey,()=>{
        ipcMain.emit('capture')
    })

    mainWindow.on('show',()=>{
        globalShortcut.register('ESC',()=>{
            mainWindow.webContents.send('pressESC')
            mainWindow.minimize()
        })
    })
    mainWindow.on('minimize',()=>{
        globalShortcut.unregister('ESC')
    })
})

app.on('will-quit', () => {
    // 注销快捷键
    // globalShortcut.unregister('CommandOrControl+X')
  
    // 注销所有快捷键
    globalShortcut.unregisterAll()
})


// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// app.on('activate', function () {
// if (BrowserWindow.getAllWindows().length === 0) createWindow()
// })

app.allowRendererProcessReuse = true //去除warning
