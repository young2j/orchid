const { app, screen,ipcMain,nativeImage,globalShortcut,BrowserWindow } = require('electron')
const path = require('path')

// const AppWindow = require('./src/mainProcess/appWindow')
const createTray = require('./mainProcess/appTray')
const Store = require('electron-store')

const store = new Store({name:'settings'})


//主窗口
const createMainWindow = (width,height)=>{
    // require('devtron').install()
    //-------------------------------
    const mainWindowConfig = {
        // width: 1600,
        // height: 800,
        width,
        height,
        resizable: false,
        movable: false,
        frame:false,
        transparent: true,//On Windows, does not work unless the window is frameless.
        // backgroundColor:"#000000",
        // opacity: 0.3, //windows or mac
        fullscreen: true,
        alwaysOnTop:process.platform==='win32', //linux 为true时，保存图片窗口会被掩盖，点不了
        skipTaskbar:true,
        hasShadow: false,
        webSecurity:false,
        webPreferences:{
            nodeIntegration:true
          },
        show:process.platform!=='win32', //windows:false;linux:true--否则一打开就是黑屏，且不为show状态就无法注册esc，无法按esc退出
        paintWhenInitiallyHidden:false //启动时屏蔽ready-to-show事件
    }
    // const mainPath = "http://localhost:8080"
    const mainPath = `file://${path.join(__dirname,'./dist/index.html')}`
    let mainWindow = new BrowserWindow(mainWindowConfig)
    mainWindow.loadURL(mainPath)
    mainWindow.on('ready-to-show',()=>{
        mainWindow.show()
    })
    mainWindow.on('close',()=>{
        mainWindow = null
    })

    //--------------
    // mainWindow.webContents.openDevTools()

    //处理托盘点击事件
    ipcMain.on('capture',()=>{
        // mainWindow.reload()
        mainWindow.webContents.send('flushDesktopCapture')
        mainWindow.show()
    })

    //--------------
    //全局快捷键
    let quickKey = store.get('quickKey') || 'F1'
    globalShortcut.register(quickKey,()=>{
        mainWindow.webContents.send('flushDesktopCapture')
        mainWindow.show()
    })
    //快捷键管理
    mainWindow.on('show',()=>{
        globalShortcut.register('ESC',()=>{
            mainWindow.minimize()
            mainWindow.webContents.send('pressESC')
            globalShortcut.unregister('ESC')
        })
    })
}



const createSettingsWindow = ()=>{
    //---------------
    //设置窗口
    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 450,
            height: 320,
            icon:nativeImage.createFromPath('./src/assets/settings.png'),
            title:'应用设置',
            resizable:false,
            webPreferences:{
                nodeIntegration:true
              },
            show:false
        }
        const settingsURL = `file://${path.join(__dirname, './mainProcess/settingsWindow.html')}`
        let settingsWindow = new BrowserWindow(settingsWindowConfig)
        settingsWindow.loadURL(settingsURL)
        settingsWindow.setMenu(null)
        settingsWindow.on('ready-to-show',()=>{
            settingsWindow.show()
        })
        settingsWindow.on('close',()=>{
            settingsWindow = null
        })
    })
}


app.on('ready', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    //------------------------------
    // 托盘图标和右键菜单
    createTray()

    //----------
    createMainWindow(width,height)

    //-----------
    createSettingsWindow()


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
})


app.on('will-quit', () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll()
})


// Quit when all windows are closed.
app.on('window-all-closed', ()=> {
    if (process.platform !== 'darwin') app.quit()
})


app.allowRendererProcessReuse = true //去除warning
