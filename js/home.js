const mustache = require('mustache');
const statusHtml = fs.readFileSync("html/home/home.html");

class Home 
{
    constructor($container)
    {
        this.$container = $container;

        this.update();
    }

    update()
    {
        this.$container.html(mustache.render(statusHtml.toString()));
    }
}

module.exports = Home