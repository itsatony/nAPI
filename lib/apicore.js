module.exports = ApiCore;

var EventEmitter = require('events').EventEmitter;
var util = require('util');


var ApiCore = function(name) {
	this.name = name;
	this._type = 'Napi';
	this._resources = {};
};
util.inherits(ApiCore, EventEmitter);


ApiCore.prototype._addResource = function(name, options) {
	this._resources[name] = new Resource(name, this, options);
	this[name] = this._resources[name];
	return this[name];
};


// api is 1 middleware
ApiCore.prototype._handleHttpRequest = function(req, res, next) {
	return this.run(req, res, next);
};


ApiCore.prototype._handleWsRequest = function(message, connection, next) {
	var req = message; // handle unify + wrap 
	var res = connection.send; // handle unify + wrap
	return this.run(req, res, next);
};


ApiCore.prototype.run = function(req, res, next) {
	var name = 'test_' + Date.now(); // minions.randomString(16, true, true, true);
	var apiCall = new ApiCall(name, this, req, res, next);
	this.emit('call', apiCall, this);
	apiCall.run();
	return apiCall;
};

