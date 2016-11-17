'use strict';

var EventEmitter = require('events'),
    util = require('util'),
    childProcess = require('child_process'),
    fs = require('fs'),
    agent = process.iocService.get('Agent'),
    configManager = process.iocService.get('ConfigManager'),
    MessageTypes = process.iocService.get('MessageTypes'),
    IPCMessage = process.iocService.get('IPCMessage');


const CHILD_PROCESS_PATH = 'process/childProcessInit.js';
const ROOT_MODULE = configManager.getRootModuleName();
const MODULE_DELIMITER = '.';

/**
 * @constructor
 * @this {AgentManager}
 * @extends {EventEmitter}
 * */
function AgentManager() {
    EventEmitter.call(this);

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

    var aid = agent.AID(name, configManager.getACConfig().alias, agentClass);

    if(self._running[aid.value])
        throw Error("Agent with aid: " + aid.value + " already exits");

    var args = [self._classes[agentClass], JSON.stringify(aid)];
    var chprocess = childProcess.fork(CHILD_PROCESS_PATH, args, {env: process.env});

    chprocess.on('exit', function () {
        delete self._running[aid.value];
        self.emit('removedAgent', aid.value);
    });

    chprocess.on('message', function (msg) {
        self.emit('message', msg);
    });

    self._running[aid.value] = chprocess;

    chprocess.send(IPCMessage(MessageTypes.START_AGENT, {classes: this.getClasses()} ));

    self.emit('newAgent', aid.value);

    return aid;
};


AgentManager.prototype.runMigratedAgent = function (name, agentClass) {

    var self = this;

    if(!self._classes[agentClass])
        throw Error("Agent class doesn't exist");

    var aid = agent.AID(name, configManager.getACConfig().alias, agentClass);

    if(self._running[aid.value])
        throw Error("Agent with aid: " + aid.value + " already exits");

    var args = [self._classes[agentClass], JSON.stringify(aid)];
    var chprocess = childProcess.fork(CHILD_PROCESS_PATH, args, {env: process.env});

    chprocess.on('exit', function () {
        delete self._running[aid.value];
        self.emit('removedAgent', aid.value);
    });

    chprocess.on('message', function (msg) {
        self.emit('message', msg);
    });

    self._running[aid.value] = chprocess;

    chprocess.send(IPCMessage(MessageTypes.START_AGENT, {classes: this.getClasses()} ));

    self.emit('newAgent', aid.value);

    return aid;
};



AgentManager.prototype.stopAgent = function (aid, msg) {

    if(this._running[aid])
        this._running[aid].send(IPCMessage(MessageTypes.STOP_AGENT, msg));
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

            loadAgents(directoryPath +'/' + parts[0], moduleName + MODULE_DELIMITER + parts[0]);

        }else if(parts[1] === 'js'){

            this.addClass(agent.AgentClass(parts[0], moduleName), directoryPath +'/' + files[i]);
        }
    }
};

module.exports = new AgentManager();
