'use strict';

var AgentClass = require('./AgentClass');

/**
 * Exports
 * */

module.exports = function (name, host, type) {
    return new AID(name, host, type);
};


/**
 * Divider used to separate agent name, host alias and agent class.
 */
var divider = "@";

/**
 * Defines a unique agent identifier. The general syntax is <code>name@host@type</code>.
 * @constructor
 * @this {AID}
 * @param {string} name Agent's local name.
 * @param {string} host Host identifier.
 * @param {Object} type Agent's class.
 */
function AID(name, host, agentClass) {
    this.name = name;
    this.host = host;
    this.agentClass = agentClass;
    this.value = name + divider + host + divider + (agentClass.value || agentClass);
}

/**
 * Creates AID object from string.
 * @param {string} aidStr String representation of AID.
 * @return {AID}
 * */
module.exports.getAIDFromString = function (aidStr) {

    var parts  = aidStr.split(divider);

    if(parts.length === 4) {

        return {
            name: parts[0],
            host: parts[1],
            agentClass: AgentClass(parts[3], parts[2])
        }
    }
};