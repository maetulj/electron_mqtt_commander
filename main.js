const { app, BrowserWindow, ipcMain } = require('electron');

// Keep a global reference of the window object.
// If not then JS will close the window as the object is garbage collected.
let mainWindow = null;
let settingsWindow = null;

let data = undefined;

global.sharedObj = { 
    data: {
        broker_url: "not-set",
        port: undefined,
        vehicle_id: 0,
        username: "",
        password: ""
    }
};

function createWindow() 
{
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });

    // Load the index.html of the app.
    mainWindow.loadFile('html/index.html');

    // Open DevTools.
    // mainWindow.webContents.openDevTools();

    // On window close.
    mainWindow.on('closed', () => {
        // Dereference the window object.
        mainWindow = null;
    });
}

// Called after finishing the initialization.
app.on('ready', () => {
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // Not on Mac.
    if (process.platform !== 'darwin')
    {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null)
    {
        createWindow();
    }
});

ipcMain.on('close-main-window', (event, arg) => {
    app.quit();
});

ipcMain.on('open-settings-window', () => {
    if (settingsWindow)
    {
        return;
    }

    settingsWindow = new BrowserWindow({
        frame: false,
        height: 450,
        width: 400,
        resizable: false
    });

    settingsWindow.loadFile('html/settings.html');

    // settingsWindow.openDevTools();

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
});

ipcMain.on('close-settings-window', () => {
    if (settingsWindow)
    {
        settingsWindow.close();
    }
});

ipcMain.on('update-settings', (event, arg) => {
    // Save data.
    global.sharedObj.data.broker_url = String(arg.broker_url);
    global.sharedObj.data.port = Number(arg.port);
    global.sharedObj.data.vehicle_id = Number(arg.vehicle_id);
    global.sharedObj.data.username = String(arg.username);
    global.sharedObj.data.password = String(arg.password);

    // Send to main window.
    mainWindow.webContents.send('update-settings', arg);
});
