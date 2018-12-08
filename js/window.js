const { remote, ipcRenderer } = require('electron');
const fs = require('fs')
const mustache = require('mustache');
const path = require("path");
const MqttClient = require(path.resolve('js/mqtt_client'));

const Home = require(path.resolve('js/home'));
const Status = require(path.resolve('js/status'));

const pointTemplate = fs.readFileSync("html/point_template.html");

class Application
{
    constructor()
    {
        this.ipcRenderer = require('electron').ipcRenderer;

        this.broker_url = remote.getGlobal('sharedObj').data.broker_url;
        this.port = remote.getGlobal('sharedObj').data.port;
        this.vehicle_id = remote.getGlobal('sharedObj').data.vehicle_id;
        this.username = undefined;
        this.password = undefined;

        this.subscribed_topic = undefined;

        this.$app_container = $('.app-container');

        this.$broker_url = $('#broker_url');
        this.$port = $('#port');
        this.$vehicle_id = $('#vehicle_id');

        this.$home_link = $('#home_link');
        this.$status_link = $('#status_link');

        this.$connect_button = $('#connect-button');
        this.$connect_spinner = this.$connect_button.find('.spinner');
        this.$connect_text = this.$connect_button.find('.text');

        this.$subscribe_topic = $('#subscribe-topic');
        this.$subscribe_button = $('#subscribe-button');

        this.$subscribed_to_topic = $('#subscribed-to-topic');
        this.$unsubscribe_button = $('#unsubscribe-button');

        this.connected = false;

        this.mqtt_client = new MqttClient();

        this.init();
    }

    init()
    {
        this.$broker_url.text(this.broker_url);
        this.$port.text(this.port);
        this.$vehicle_id.text(this.vehicle_id);

        this.$connect_spinner.toggle(false);

        this.$connect_button.on('click', this.onConnect.bind(this));

        this.$subscribe_button.on('click', this.onSubscribe.bind(this));

        this.$unsubscribe_button.on('click', this.onUnsubscribe.bind(this));

        this.ipcRenderer.on('update-settings', (event, arg) => {
            this.broker_url = String(arg.broker_url);
            this.port = Number(arg.port);
            this.vehicle_id = Number(arg.vehicle_id);
            this.username = String(arg.username);
            this.password = String(arg.password);
        
            $('#broker_url').text(this.broker_url);
            $('#port').text(this.port);
            $('#vehicle_id').text(this.vehicle_id);
        });

        this.$home_link.on('click', this.onHome.bind(this));
        this.$status_link.on('click', this.onStatus.bind(this));

        // Init.
        this.onHome();
    }

    onConnect()
    {
        this.$connect_spinner.toggle(true);

        if (this.mqtt_client.isConnected())
        {
            // Disconnect.
            this.mqtt_client.close();

            this.$connect_spinner.toggle(false);
            this.$connect_button.removeClass('btn-danger');
            this.$connect_button.removeClass('btn-success');
            this.$connect_button.addClass('btn-primary');
            this.$connect_text.text('Connect');

            return;
        }

        this.mqtt_client.connect({ 
            host: this.broker_url,
            port: 1883,
            username: this.username || null,
            password: this.password || null
            
        }).then((result) => {
            // Success.
            this.$connect_spinner.toggle(false);
            this.$connect_button.removeClass('btn-primary');
            this.$connect_button.removeClass('btn-danger');
            this.$connect_button.addClass('btn-success');
            this.$connect_text.text("Connected");
        }, (err) => {
            // Failure.
            this.$connect_spinner.toggle(false);
            this.$connect_button.removeClass('btn-primary');
            this.$connect_button.removeClass('btn-success');
            this.$connect_button.addClass('btn-danger');
            this.$connect_text.text("Failed");
        });
    }

    onSubscribe()
    {
        if ( ! this.mqtt_client.isConnected())
        {
            return;
        }

        const topic = this.$subscribe_topic.val();

        console.log("subscribing to " + topic);

        this.$subscribed_to_topic.val(topic);

        this.mqtt_client.subscribe(topic);

        this.onMessage((topic, message) => {
            console.log("topic", topic);
            console.log("message", message.toString());
        })
    }

    onUnsubscribe()
    {
        if ( ! this.mqtt_client.subscribed_topic)
        {
            return;
        }

        this.mqtt_client.unsubscribe();
        this.$subscribed_to_topic.val("None");
        
    }

    onMessage(callback)
    {
        this.mqtt_client.registerMessageCallback(callback);
    }

    onHome()
    {
        let home = new Home(this.$app_container);
    }

    onStatus()
    {
        let status = new Status(this.$app_container);
    }
};

let app = new Application();

$('.settings-button').on('click', () => {
    ipcRenderer.send('open-settings-window', {});
});



$('#close-button').on('click', () => {
    console.log("test");
});

$('.save-points').on('click', () => {
    console.log("save");
});

// Read json file.
var contents = fs.readFileSync("data/route.json");

let parser = new MissionParser(contents);

$('.point-container').html(mustache.render(pointTemplate.toString(), parser.formatWaypoints()));
