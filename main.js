const { app, screen } = require('electron')
// const path = require('path')

const AppWindow = require('./src/utils/appWindow')




app.on('ready', () => {
    require('devtron').install()

    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    console.log(width,height);

    const mainWindowConfig = {
        width: 1600,
        height: 800,
        // width,
        // height,
        // resizable:false,
        resizable: true,
        movable: false,
        // frame:false,
        transparent: true,
        opacity: 0,
        fullscreen: process.platform === 'win32' || undefined,
        // fullscreen: true,
        // alwaysOnTop:true,
        hasShadow: false
    }
    const mainPath = "http://localhost:8080"
    // const mainPath = path.join(__dirname,'./dist/index.html')


    let mainWindow = new AppWindow(mainWindowConfig, mainPath)
    //
    mainWindow.webContents.openDevTools()
    //

    // ipcMain.on('move-app',(err,args)=>{
    //     console.log('main move:',args)
    //     mainWindow.setPosition(args.screenX,args.screenY)
    // })
    //
    // ipcMain.on('open-settings-window', () => {
    //     const settingsWindowConfig = {
    //         width: 500,
    //         height: 400,
    //         parent: mainWindow, //没效果？？
    //         // title:'设置',
    //     }
    //     const settingsURL = `file://${path.join(__dirname, './src/windowPages/settings.html')}`
    //     let settingsWindow = new AppWindow(settingsWindowConfig, settingsURL)
    //     settingsWindow.on('close', () => {
    //         settingsWindow = null
    //     })
    //     settingsWindow.setMenu(null)
    // })
    // //设置菜单
    // const appMenu = Menu.buildFromTemplate(menuTemplate)
    // // Menu.setApplicationMenu(appMenu) //会为所有窗口设置菜单
    // mainWindow.setMenu(appMenu)
})


// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// app.on('activate', function () {
// if (BrowserWindow.getAllWindows().length === 0) createWindow()
// })

app.allowRendererProcessReuse = true //去除warning

/*
ipcMain.emit('event') <=> ipcMain.on('event',callback)
BrowserWindow.webContents/ipcRenderer.send('event')<=>ipcRenderer.on('event',callback)
*/