'use strict';

/**
 * argv[2] is the path to agent module.
 * argv[3] is the agent's (aid) unique identifier.
 * */

var agentModule = require(process.argv[2]);

if(typeof agentModule !== 'function')
    process.exit();

var agent = agentModule();

var q = require('q'),
    IPCMessage = process.iocService.get('IPCMessage'),
    MessageTypes = process.iocService.get('MessageTypes'),
    AID = process.iocService.get('Agent').AID,
    Logger = process.iocService.get('Logger');

var classes = [];
var eventQueue = [];

Logger.on('log', function (msg) {
    process.send(IPCMessage(MessageTypes.LOG, msg));
});



process.on('message', function (msg) {

    if(msg.type === MessageTypes.START_AGENT){

        classes = msg.content.classes;
        initAgent();
        agent.postConstruct();

    }else if (msg.type === MessageTypes.STOP_AGENT){

        agent.preDestroy();
        process.exit();

    }else if (msg.type === MessageTypes.ACL_MESSAGE){

        agent.handleMessage(msg.content);

    }else if(msg.type === MessageTypes.FOUND_CLASSES){

        classes = msg.content;

    }else if (msg.type === MessageTypes.FOUND_AGENT) {
        agentFoundEmitter(msg.content, MessageTypes.GET_AGENT);
    }else if (msg.type === MessageTypes.FOUND_AGENTS){
        agentFoundEmitter(msg.content, MessageTypes.GET_AGENTS);
    }else if (msg.type === MessageTypes.NO_AGENT){
        agentFoundEmitter(msg.content, MessageTypes.GET_AGENT);
    }else if (msg.type === MessageTypes.NO_AGENTS){
        agentFoundEmitter(msg.content, MessageTypes.GET_AGENTS);
    }
});

process.on('SIGTERM', function () {

    agent.preDestroy();
    process.exit();
});

process.on('SIGHUP', function () {

    agent.preDestroy();
    process.exit();
});

function initAgent() {

    agent.aid = JSON.parse(process.argv[3]);

    agent.messageManager = {

        post: function (ACLMessage) {
            process.send(IPCMessage(MessageTypes.ACL_MESSAGE, ACLMessage));
        }
    };

    agent.agentManager = {

        getAgent: function (type, all, callback) {

            var msgType = all ? MessageTypes.GET_AGENTS : MessageTypes.GET_AGENT;

            if(!callback || typeof callback !== 'function')
                throw Error('callback function must be provided');

            process.send(IPCMessage(msgType, {
                sender: agent.aid.value,
                agentClass: type
            }));

            eventQueue.push({

                event: msgType,
                agentClass: type,
                callback: callback
            });
        },

        getClasses: function () {
            return classes;
        }
    };
}

function agentFoundEmitter(content, msgType) {

    for(var i = 0; i < eventQueue.length; i++){

        if(eventQueue[i].event === msgType){

            if(eventQueue[i].agentClass === content.agentClass){
                eventQueue[i].callback(content.data);
                eventQueue.splice(i, 1);
                break;
            }
        }
    }
}