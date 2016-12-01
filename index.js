
module.exports.agent = {};
module.exports.agent.Agent = require('./lib/agent/Agent');
module.exports.agent.AgentClass = require('./lib/agent/AgentClass');
module.exports.agent.AID = require('./lib/agent/AID');

module.exports.fipa = {};
module.exports.fipa.ACLMessage = require('./lib/fipa/ACLMessage').ACLMessage;
module.exports.fipa.ACLMakeReply = require('./lib/fipa/ACLMessage').ACLMakeReply;
module.exports.fipa.ACLPerformatives = require('./lib/fipa/ACLPerformatives');

module.exports.manager = {};
module.exports.manager.AgentManager = require('./lib/manager/AgentManager');