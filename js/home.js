const { ipcRenderer } = require('electron');
const mustache = require('mustache');
const homeHtml = fs.readFileSync('html/home/home.html');
const logHtml = fs.readFileSync('html/home/log.html');

class Home 
{
    constructor($container)
    {
        this.$container = $container;
        
        this.log = [];

        this.log_limit = 10;

        this.update();

        ipcRenderer.on('mqtt-message', (event, arg) => {
            console.log("msg", arg);
            this.log.push(arg);

            // Remove oldest element if log is full. 
            if (this.log.length > this.log_limit)
            {
                this.log.shift();
            }

            this.update();
        });
    }

    /**
     * Update the home window.
     */
    update()
    {
        this.$container.html(mustache.render(homeHtml.toString()));
        this.$container.find('.logger-container').html(mustache.render(logHtml.toString(), { 
            log: this.log 
        }));
        console.log(this.log);

        this.$container.find('#subscribe-button').on('click', () => {
            let topic = this.$container.find('#subscribe-topic').val();

            if (topic === "")
            {
                console.error("No topic specified!");
                this.expectError(true);
                return;
            }

            this.expectError(false);

            ipcRenderer.send('subscribe', {
                'topic': topic
            });
        });

        this.$container.find('#unsubscribe-button').on('click', () => {
            console.log("unsub");
            ipcRenderer.send('unsubscribe', {
                'topic': '/test'
            });
        });
    }

    /**
     * Display or hide the error on the subscribe button.
     * 
     * @param {*} error If true the button is changed to btn-danger. Else to btn-success.
     */
    expectError(error)
    {
        if (error)
        {
            this.$container.find('#subscribe-button').removeClass('btn-success').addClass('btn-danger');
        }
        else 
        {
            this.$container.find('#subscribe-button').removeClass('btn-danger').addClass('btn-success');
        }
    }
}

module.exports = Home