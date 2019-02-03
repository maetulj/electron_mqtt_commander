const mustache = require('mustache');
const statusHtml = fs.readFileSync("html/status/status.html");
const statesHtml = fs.readFileSync("html/status/states.html");
const Robot = require('./robot');

class Status
{

    constructor($container)
    {
        this.remote = require('electron').remote;
        this.ipcRenderer = require('electron').ipcRenderer;

        this.counter = 0;

        this.$container = $container;

        this.data = {
            states: []
        };

        this.robots = [];

        this.$container.html(mustache.render(statusHtml.toString()));

        this.$states = this.$container.find('.states');

        this.$add_state_button = $('#add_state');
        this.init();

        this.update();
    }

    init()
    {
        this.$add_state_button.on('click', this.addState.bind(this));
    }

    update()
    {
        let robots = {
            states: this.robots.map((robot) => {
                    return robot.serialize();
                })
        };

        this.$states.html(mustache.render(statesHtml.toString(), robots));

        this.$container.find('.pause-btn').on('click', this.pause.bind(this));

        $('.remove-state').on('click', this.removeState.bind(this));

        this.$container.find('.robot-settings').on('click', this.robotSettings.bind(this));
    }

    addState()
    {
        let robot = new Robot(this.$container, this.counter);
        this.robots.push(robot);

        this.data.states.push({
            id: this.counter++,
            state: "IDLE",
            connected: Math.floor(Math.random() * 2)
        });

        ipcRenderer.send('add-robot', {robot});

        console.log("adding data", this.remote.getGlobal('sharedObj').robots);

        this.update();
    }

    removeState(event)
    {
        let id = $(event.target).closest(".state").attr("data-id");

        this.robots = this.robots.filter((robot) => {
            console.log(id, robot.getId(), id != robot.getId());
            return robot.getId() != id;
        });

        ipcRenderer.send('remove-robot', id);

        this.update();
    }

    pause(event)
    {
        let id = $(event.target).closest(".state").attr("data-id");

        console.log("pausing ", id);
    }

    robotSettings()
    {
        let id = $(event.target).closest(".state").attr("data-id");

        ipcRenderer.send('open-robot-settings', {
            id: id});
        
    }
};

module.exports = Status 
