'use strict';

/**
 * Exports
 * */
module.exports = Agent;

/**
 * Agent object represents an abstract agent that other agents 
 * must inherit and implement (override) its methods.
 * 
 * @Constructor
 * @this{Agent}
 * */
function Agent() {
    this.aid = null;
    this.messageManager = null;
    this.agentManager = null;
}

/**
 * Method that is invoked when Agent center receives a message for this agent.
 *
 * @param {String} aclMessage received ACL message.
 * */
Agent.prototype.handleMessage = function (aclMessage) {
};

/**
 * This method will be invoked by the environment after agent is created.
 * */
Agent.prototype.postConstruct = function () {
};

/**
 * This method will be invoked by the environment before agent is destroyed.
 * */
Agent.prototype.preDestroy = function () {
};

/**
 * This method initiates migration process of an agent.
 *
 * @param {String} host is alias of the host on which agent should be moved.
 * @param {String} aclMessage is ACL message that agent should receive after migration.
 * */
Agent.prototype.migrate = function (host, aclMessage) {
};

/**
 * This method will be invoked by the environment after migration of an agent.
 *
 * @param {String} aclMessage received ACL message.
 * */
Agent.prototype.postMigration = function (aclMessage) {
};
