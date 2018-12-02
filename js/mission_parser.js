

class MissionParser
{
    constructor(jsonFile)
    {
        this.mission = JSON.parse(jsonFile);
    }

    getWaypoints()
    {
        let waypoints = [];

        this.mission.steps.forEach( step => {
            waypoints.push({
                x: step.pose.x,
                y: step.pose.y
            });
        });

        return waypoints;
    }

    formatWaypoints()
    {
        let counter = 0;

        return {
            'waypoints': this.getWaypoints(),
            'count' : function () {
                return function (text, render) {
                    // note that counter is in the enclosing scope
                    return counter++;
                }
            }
        }
    }

    savePoints()
    {
        
    }
}
