const mqtt = require('mqtt');

class MqttClient 
{
    /**
     * Consturct the MQTT Client.
     */
    constructor()
    {
        this.client = undefined;
        this.is_connected = false;

        this.subscriptions = [];
    }

    /**
     * Connect to the broker.
     * 
     * @param {*} options 
     */
    connect(options)
    {
        console.log("option", options);
        
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

    /**
     * Close connection to the broker.
     */
    close()
    {
        this.client.end();
    }

    /**
     * Subscribe to the given topic.
     * 
     * @param {*} topic Topic to subscribe to. 
     */
    subscribe(topic)
    {
        if ( ! this.isConnected())
        {
            return false;
        }

        return new Promise((resolve, reject) => {
            this.client.subscribe(topic, (err, granted) => {
                if (granted)
                {
                    this.subscriptions.push(topic);
                    resolve(true);
                }
                else  {
                    reject('Could not subscribe!' + err);
                }
            });
        });
    }

    /**
     * Unsubscribe from the given topic.
     */
    unsubscribe(topic)
    {
        console.log("mqtt unsub", topic);
        return new Promise((resolve, reject) => {
            this.client.unsubscribe(topic, (err) => {
                console.log("unsub test", err);
                if (err) 
                {
                    console.error("Failed to unsubscribe to ", topic);
                    console.error(err);
                    reject("Failed to unsubscribe from " + topic);
                }
                else 
                {
                    // Remove subscription from subscriptions.
                    this.subscriptions = this.subscriptions.filter( subscription => subscription !== topic);
                    console.log("Successfully unsubsribed from " + topic);
                    resolve(true);
                }
            });
        });
    }

    /**
     * Return all active subscriptions.
     */
    getSubscriptions()
    {
        return this.subscriptions;
    }

    /**
     * Register callback on new message.
     * 
     * @param {*} callback Callback to be called on new message.
     */
    registerMessageCallback(callback)
    {
        if ( ! this.isConnected())
        {
            return false;
        }

        this.client.on('message', callback);
    }
};

module.exports = MqttClient;
