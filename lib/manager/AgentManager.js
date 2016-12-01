'use strict';

var EventEmitter = require('events'),
    util = require('util'),
    childProcess = require('child_process'),
    fs = require('fs'),
    Agent = require('../agent/Agent'),
    AID = require('../agent/AID'),
    AgentClass = require('../agent/AgentClass'),
    MessageTypeEnum = require('siebogjs-common').enums.MessageTypeEnum,
    Message = require('siebogjs-common').structs.Message,
    AgentManagerEventEnum = require('siebogjs-common').enums.AgentManagerEventEnum;


const CHILD_PROCESS_PATH = __dirname + '/../process/AgentProcess.js';
const ROOT_MODULE = 'com';
const MODULE_DELIMITER = '.';

module.exports = function(host) {
    return new AgentManager(host);
};

/**
 * @constructor
 * @this {AgentManager}
 * @extends {EventEmitter}
 * */
function AgentManager(host) {
    EventEmitter.call(this);

    this.host = host;
    this._running = {};
    this._classes = {};
}

util.inherits(AgentManager, EventEmitter);


/**
 * Runs an agent of a given type as a child process and sets the agent's aid.
 *
 * @param {string} name Agent's runtime name.
 * @param {string} type Agent's type value.
 * */
AgentManager.prototype.runAgent = function (name, agentClass) {

    var self = this;

    if(!self._classes[agentClass])
        throw Error("Agent class doesn't exist");

    var aid = AID(name, this.host, agentClass);

    if(self._running[aid.value])
        throw Error("Agent with aid: " + aid.value + " already exits");

    var args = [self._classes[agentClass], JSON.stringify(aid)];
    var chprocess = childProcess.fork(CHILD_PROCESS_PATH, args, {env: process.env});

    chprocess.on('exit', function () {
        delete self._running[aid.value];
        self.emit(AgentManagerEventEnum.REMOVED_AGENT, aid.value);
    });

    chprocess.on(AgentManagerEventEnum.MESSAGE, function (msg) {
        self.emit(AgentManagerEventEnum.MESSAGE, msg);
    });

    self._running[aid.value] = chprocess;

    chprocess.send(Message(MessageTypeEnum.START_AGENT, {classes: this.getClasses()}));

    self.emit(AgentManagerEventEnum.NEW_AGENT, aid.value);

    return aid;
};


AgentManager.prototype.runMigratedAgent = function (migrationData) {

    var self = this;

    var agentClass = migrationData.agentClass;
    var name = migrationData.name;

    if(!self._classes[agentClass])
        throw Error("Agent class doesn't exist");

    var aid = AID(name, this.host, agentClass);

    if(self._running[aid.value])
        throw Error("Agent with aid: " + aid.value + " already exits");

    var args = [self._classes[agentClass], JSON.stringify(aid)];
    var chprocess = childProcess.fork(CHILD_PROCESS_PATH, args, {env: process.env});

    chprocess.on('exit', function () {
        delete self._running[aid.value];
        self.emit(AgentManagerEventEnum.REMOVED_AGENT, aid.value);
    });

    chprocess.on(AgentManagerEventEnum.MESSAGE, function (msg) {
        self.emit(AgentManagerEventEnum.MESSAGE, msg);
    });

    self._running[aid.value] = chprocess;

    chprocess.send(Message(MessageTypeEnum.POST_MIGRATION, migrationData));
    chprocess.send(Message(MessageTypeEnum.FOUND_CLASSES, {classes: this.getClasses()}));

    self.emit(AgentManagerEventEnum.NEW_AGENT, aid.value);

    return aid;
};



AgentManager.prototype.stopAgent = function (aid, msg) {

    if(this._running[aid])
        this._running[aid].send(Message(MessageTypeEnum.STOP_AGENT, msg));
};

AgentManager.prototype.addClass = function (agentClass, path) {
    this._classes[agentClass.value] = path;
};

AgentManager.prototype.getClasses = function () {

    var classes = [];

    for(var prop in this._classes)
        classes.push(prop);

    return classes;
};

AgentManager.prototype.getRunning = function () {

    var running = [];

    for(var prop in this._running)
        running.push(prop);

    return running;
};

AgentManager.prototype.isRunning = function (aid) {
    return !!this._running[aid];
};
AgentManager.prototype.sendMessage = function (aid, msg) {

    if(this._running[aid])
        this._running[aid].send(msg);
};

AgentManager.prototype.loadAgentClasses = function (directoryPath, moduleName) {

    var files = fs.readdirSync(directoryPath);

    for(var i = 0; i < files.length; i++){

        var parts = files[i].split('.');

        if(parts.length === 1){

            this.loadAgentClasses(directoryPath +'/' + parts[0], moduleName + MODULE_DELIMITER + parts[0]);

        }else if(parts[1] === 'js'){

            this.addClass(AgentClass(parts[0], moduleName), directoryPath +'/' + files[i]);
        }
    }
};

