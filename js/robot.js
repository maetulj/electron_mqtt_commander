class Robot 
{
    constructor($container, id)
    {
        this.$container = $container;

        this.id = id;
        
        this.data = {
            paused: false,
            state: "IDLE",
            online: false
        }
    }

    getId()
    {
        return this.id;
    }

    vehicleStateUpdate(data)
    {
        this.data = {...this.data, ...data};
    }

    serialize()
    {
        return {
            id: this.id,
            state: this.state,
            online: this.online
        }
    }

    deserialize(object)
    {
        return new Robot("", 1);
    }

};

module.exports = Robot;