'use strict';

/**
* Exports
* */
module.exports = AgentClass;


/**
* Divider used to separate module and name of an agent class.
*/
var divider = "@";

/**
 * Agent type is represented by its module and name. Where module represents
 * directory path for this agent and name represents the name of the .js file
 * which contains the agent code.
 * @param {string} name Agent's file name.
 * @param {module} module Agent's file path.
 * @return{AgentClass}
 * */
function AgentClass(name, module) {

    return {
        name: name,
        module: module,
        value: module + divider + name
    };
}