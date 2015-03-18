var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Resource = require(__dirname + '/resource');
var ApiCall = require(__dirname + '/apicall');


var ApiCore = function(name, config) {
	this._name = name;
	this._type = 'Napi';
	this._resources = {};
	this._config = config;
};
util.inherits(ApiCore, EventEmitter);
module.exports = ApiCore;


ApiCore.prototype._addResource = function(name, config, callback) {
	this._resources[name] = new Resource(name, this, config, callback);
	this[name] = this._resources[name];
	return this[name];
};


ApiCore.prototype.toMiddleware = function() {
	return this.handle();
};


ApiCore.prototype.handle = function() {
	var thisApiCore = this;
	return function(req, res, next) {
		var name = 'test_' + Date.now(); // minions.randomString(16, true, true, true);
		var layers = thisApiCore._config.layers || [];
		// var apiCall = new ApiCall(name, thisApiCore, layers, req, res, next);
		// TODO: 
		// -- unify req, res 
		// call specifier like this : users.get.byId({ _id:'123' }, { limit:1 }, function(err, results) { console.log('got answer:', err, results); });
		thisApiCore[req.query.resource][req.query.method][req.query.specifier](req.query.document, req.query.options, function(err, results) { next(); });
		this.emit('call', apiCall, thisApiCore);
		return apiCall;
	}
};



