const mustache = require('mustache');
const statusHtml = fs.readFileSync("html/status/status.html");
const statesHtml = fs.readFileSync("html/status/states.html");

class Status
{

    constructor($container)
    {
        this.$container = $container;

        this.data = {
            states: []
        };

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
        this.$states.html(mustache.render(statesHtml.toString(), this.data));

        $('.remove-state').on('click', this.removeState.bind(this));
    }

    addState()
    {
        this.data.states.push({
            id: 1,
            state: "IDLE",
            connected: true
        });

        console.log("addign data");

        this.update();
    }

    removeState()
    {
        console.log($(this).parent().attr("data-id"))

        this.update();
    }
};

module.exports = Status 
