'use strict';

module.exports.AID = function (name, host, type) {
    return new AID(name, host, type);
};

module.exports.AID.getAIDFromString = getAIDFromString;



/**
 * Defines a unique agent identifier. The general syntax is <code>name:host:type</code>.
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
    this.value = name + ':' + host + ':' + (agentClass.value || agentClass);
}

/**
 * Creates AID object from string.
 * @param {string} aidStr String representation of AID.
 * @return {AID}
 * */
function getAIDFromString(aidStr) {

    var parts  = aidStr.split(':');

    if(parts.length === 4) {

        return {
            name: parts[0],
            host: parts[1],
            agentClass: AgentClass(parts[3], parts[2])
        }
    }
}