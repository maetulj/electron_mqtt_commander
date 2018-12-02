const mqtt = require('mqtt');

class MqttClient 
{
    constructor()
    {
        this.client = undefined;
        this.is_connected = false;

        this.subscribed_topic = undefined;
    }

    connect(options)
    {
        console.log(options);
        
        this.client = mqtt.connect(options);

        this.client.on('close', () => {
            this.is_connected = false;
        });

        this.client.on('connect', () => {
            this.is_connected = true;

            return;
        });

        this.client.on('error', (err) => {
            console.log("Failed to connect", err);
        });

        return new Promise( (resolve, reject) => {
            const ms = 1000;

            // Timeout for connection.
            setTimeout(() => {
                if (this.client.connected)
                {
                    resolve('connected');
                    return;
                }

                console.log('Timeout after ' + ms);
                reject(new Error('fail'));
            }, ms);
        });
    }

    isConnected()
    {
        return this.client ? this.client.connected : false;
    }

    close()
    {
        this.client.end();
    }

    subscribe(topic)
    {
        this.client.subscribe(topic);
    
        this.subscribed_topic = topic;
    }

    unsubscribe()
    {
        this.client.unsubscribe(this.subscribed_topic);
    }

    registerMessageCallback(callback)
    {
        this.client.on('message', callback);
    }
};

module.exports = MqttClient;
