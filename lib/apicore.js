var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Resource = require(__dirname + '/resource');
var ApiCall = require(__dirname + '/apicall');


var ApiCore = function(name) {
	this._name = name;
	this._type = 'Napi';
	this._resources = {};
};
util.inherits(ApiCore, EventEmitter);
module.exports = ApiCore;


ApiCore.prototype._addResource = function(name, options) {
	this._resources[name] = new Resource(name, this, options);
	this[name] = this._resources[name];
	return this[name];
};


ApiCore.prototype.toMiddleware = function() {
	return this.handle;
};


ApiCore.prototype.handle = function(req, res, next) {
	var name = 'test_' + Date.now(); // minions.randomString(16, true, true, true);
	var apiCall = new ApiCall(name, this, req, res, next);
	this.emit('call', apiCall, this);
	apiCall.run();
	return apiCall;
};



