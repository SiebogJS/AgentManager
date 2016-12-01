'use strict';

var map = {};

var DependencyService = {

    add: function (name, path) {
        map[name] = {
            path: path,
            module: null
        };
    },

    get: function (name) {

        if(!map[name])
            throw Error("Module with a given name doesn't exist");

        if(!map[name].module)
            map[name].module = require(map[name].path);

        return map[name].module;
    },

    remove: function (name) {
        delete map[name];
    },

    list: function () {
        return JSON.parse(JSON.stringify(map));
    }
};


map['Agent'] = {module: require('../../agent/Agent')};
map['AID'] = {module: require('../../agent/AID')};
map['AgentClass'] = {module: require('../../agent/AgentClass')};
map['ACLPerformatives'] = {module: require('../../fipa/ACLPerformatives')};
map['ACLMessage'] = {module: require('../../fipa/ACLMessage')};
map['MessageTypeEnum'] = {module: require('siebogjs-common').enums.MessageTypeEnum};
map['Message'] = {module: require('siebogjs-common').structs.Message};

module.exports = DependencyService;