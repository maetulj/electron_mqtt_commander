const { remote, ipcRenderer } = require('electron');

document.getElementById('broker-url').value = remote.getGlobal('sharedObj').data.broker_url;
document.getElementById('vehicle-id').value = remote.getGlobal('sharedObj').data.vehicle_id;
document.getElementById('port').value = remote.getGlobal('sharedObj').data.port;
document.getElementById('username').value = remote.getGlobal('sharedObj').data.username;
document.getElementById('password').value = remote.getGlobal('sharedObj').data.password;

function validateURL(str) 
{
    // For now do not validate url.
    return true;    
}

function validateNumber(input)
{
    return !isNaN(parseFloat(input)) && isFinite(input);
}

$('.save-button').on('click', () => {
    const broker_url = document.getElementById('broker-url').value;
    const vehicle_id = document.getElementById('vehicle-id').value;
    const port = document.getElementById('port').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Values should not be empty!
    if ( ! broker_url || ! vehicle_id)
    {
        alert("Input necessary!");
        return;
    }

    if ( ! validateURL(broker_url))
    {
        alert("Broker URL not a valid IP!");
        return;
    }

    if ( ! validateNumber(port))
    {
        alert("Port needs to be a number!");
        return;
    }

    if ( ! validateNumber(vehicle_id))
    {
        alert("Vehicle Id needs to be a number!");
        return;
    }

    let mainWindow = remote.getGlobal('win');

    if (mainWindow)
    {
        mainWindow.webContents.send('update-settings', {
            broker_url: broker_url,
            port: port,
            username: username,
            password: password,
            vehicle_id: vehicle_id
        });
    }

    ipcRenderer.send('update-settings', {
        broker_url: broker_url,
        port: port,
        username: username,
        password: password,
        vehicle_id: vehicle_id
    });

    ipcRenderer.send('close-settings-window');
});

$('.close-button').on('click', () => {
    console.log("close window");
    ipcRenderer.send('close-robot-settings');

});