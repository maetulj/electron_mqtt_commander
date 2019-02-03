const { app, BrowserWindow, ipcMain } = require('electron');
const MqttClient = require('./js/mqtt_client');

// Keep a global reference of the window object.
// If not then JS will close the window as the object is garbage collected.
let mainWindow = null;
let settingsWindow = null;
let robotSettingsWindow = null;

let data = undefined;

global.sharedObj = { 
    data: {
        broker_url: undefined,
        port: undefined,
        vehicle_id: 0,
        username: "",
        password: ""
    },
    robots: []
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
    mainWindow.webContents.openDevTools();

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

ipcMain.on('add-robot', (event, arg) => {
    console.log(arg);
    global.sharedObj.robots.push(Number(arg));
});

ipcMain.on('remove-robot', (event, id) => {
    console.log("removeign", id);
    global.sharedObj.robots = global.sharedObj.robots.filter( (robot) => {
        console.log(id, robot.getId(), id != robot.getId());
        return robot.getId() != id;
    });
});

ipcMain.on('close-robot-settings', () => {
    if (robotSettingsWindow)
    {
        robotSettingsWindow.close();
    }
});

ipcMain.on('open-robot-settings', (event, arg) => {
    console.log(arg);
    if (robotSettingsWindow)
    {
        return;
    }

    robotSettingsWindow = new BrowserWindow({
        frame: false,
        height: 450,
        width: 400,
        resizable: false
    });

    robotSettingsWindow.loadFile('html/robot-settings.html');

    // robotSettingsWindow.openDevTools();

    robotSettingsWindow.on('closed', () => {
        robotSettingsWindow = null;
    });
});

//////////////////
// Mqtt.
//////////////////
var mqtt_client = new MqttClient();

/**
 * Message callback.
 * 
 * @param {*} topic 
 * @param {*} message 
 */
function mqttMessageCallback(topic, message)
{   
    console.log("topic", topic);
    console.log("message", message.toString());

    mainWindow.webContents.send('mqtt-message', {
        topic: topic,
        message: message.toString()
    });
}

// Connection request.
ipcMain.on('connect-request', (event, arg) => {
    mqtt_client.connect(arg).then((result) => {
        // Register message callback.
        mqtt_client.registerMessageCallback(mqttMessageCallback);
        event.sender.send('connect-response', result);
    },
    (error) => {
        event.sender.send('connect-response', false);
    });
});

// Request fro checking if connected.
ipcMain.on('is-connected-request', (event, arg) => {
    let response = mqtt_client.isConnected();
    event.sender.send('is-connected-response', response);
});

// Disconnect request.
ipcMain.on('disconnect-request', (event, arg) => {
    mqtt_client.close();
    event.sender.send('disconnected-response', true);
});

// Subscribe to topic request.
ipcMain.on('subscribe', (event, arg) => {
    mqtt_client.subscribe(arg.topic).then((result) => {
        if ( ! result)
        {
            console.error("Failed to subscribe!");
            return;
        }

        let subscriptions = mqtt_client.getSubscriptions();
        event.sender.send('subscriptions-response', subscriptions);
        console.log("subs", subscriptions);
    });
});

// Unsubscribe from topic request.
ipcMain.on('unsubscribe-request', (event, arg) => {
    console.log("unsubscribing", arg);
    console.log(arg)

    mqtt_client.unsubscribe(arg)
    .then((result) => {
        event.sender.send('unsubscribe-response', result);
        let subscriptions = mqtt_client.getSubscriptions();
        event.sender.send('subscriptions-response', subscriptions);
    },
    (error) => {
        console.error("Failed to unsubscribe from " + arg);
    });
});

// Get active subscriptions request.
ipcMain.on('subscriptions-request', (event, arg) => {
    let subscriptions = mqtt_client.getSubscriptions();
    console.log("subs", subscriptions);
    event.sender.send('subscriptions-response', subscriptions);
});


