'use strict';

process.DependencyService = require('./service/DependencyService');

/**
 * argv[2] is the path to agent module.
 * argv[3] is the agent's (aid) unique identifier.
 * */
var agentModule = require(process.argv[2]);
var AgentManagerEventEnum = require('siebogjs-common').enums.AgentManagerEventEnum;


if(typeof agentModule !== 'function')
    process.exit();

var agent = agentModule();

var q = require('q'),
    Message = require('siebogjs-common').structs.Message,
    MessageTypeEnum = require('siebogjs-common').enums.MessageTypeEnum,
    AID = require('../agent/AID');
    //Logger = process.iocService.get('Logger');

var classes = [];
var eventQueue = [];

/*
Logger.on('log', function (msg) {
    process.send(IPCMessage(MessageTypes.LOG, msg));
});
 */

process.on(AgentManagerEventEnum.MESSAGE, function (msg) {

    if(msg.type === MessageTypeEnum.START_AGENT){

        classes = msg.content.classes;
        initAgent();
        agent.postConstruct();

    }else if(msg.type === MessageTypeEnum.POST_MIGRATION){

        initAgent(msg.content.state);
        agent.postMigration(msg.content.aclMessage);

    }else if (msg.type === MessageTypeEnum.STOP_AGENT){

        agent.preDestroy();
        process.exit();

    }else if (msg.type === MessageTypeEnum.ACL_MESSAGE){

        agent.handleMessage(msg.content);

    }else if(msg.type === MessageTypeEnum.FOUND_CLASSES){

        classes = msg.content;

    }else if (msg.type === MessageTypeEnum.FOUND_AGENT) {
        agentFoundEmitter(msg.content, MessageTypeEnum.GET_AGENT);
    }else if (msg.type === MessageTypeEnum.FOUND_AGENTS){
        agentFoundEmitter(msg.content, MessageTypeEnum.GET_AGENTS);
    }else if (msg.type === MessageTypeEnum.NO_AGENT){
        agentFoundEmitter(msg.content, MessageTypeEnum.GET_AGENT);
    }else if (msg.type === MessageTypeEnum.NO_AGENTS){
        agentFoundEmitter(msg.content, MessageTypeEnum.GET_AGENTS);
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

function initAgent(state) {

    agent.aid = JSON.parse(process.argv[3]);

    for(var agentProp in agent) {
        console.log(agentProp);
        for(var stateProp in state) {

            if(agentProp === stateProp) {
                agent[agentProp] = state[stateProp];

            }
        }
    }

    agent.messageManager = {

        post: function (ACLMessage) {
            process.send(Message(MessageTypeEnum.ACL_MESSAGE, ACLMessage));
        }
    };

    agent.agentManager = {

        getAgent: function (type, all, callback) {

            var msgType = all ? MessageTypeEnum.GET_AGENTS : MessageTypeEnum.GET_AGENT;

            if(!callback || typeof callback !== 'function')
                throw Error('callback function must be provided');

            process.send(Message(msgType, {
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

    agent.migrate = function (host, aclMsg) {

        var state = JSON.parse(JSON.stringify(agent));

        if(state.aid){
            delete state.aid;
        }

        process.send(Message(MessageTypeEnum.MIGRATE_AGENT,
            {   host: host,
                state: state,
                aclMessage: aclMsg,
                name: agent.aid.name,
                agentClass: agent.aid.agentClass,
                odlAid: agent.aid.value
            }
        ));
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