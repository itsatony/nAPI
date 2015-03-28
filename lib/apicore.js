var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Resource = require(__dirname + '/resource');
var ApiCall = require(__dirname + '/apicall');


var ApiCore = function(name, config) {
	this._name = name;
	this._type = 'Napi';
	this._resources = {};
	this._config = config;
	this._apicalls = {};
	this._documentation = {		
	};
};
util.inherits(ApiCore, EventEmitter);
module.exports = ApiCore;


ApiCore.prototype._addResource = function(name, config, callback) {
	name = name.toLowerCase();
	this._documentation[name] = {};
	this._resources[name] = new Resource(name, this, config, callback);
	this[name] = this._resources[name];
	return this[name];
};


ApiCore.prototype._removeResource = function(name) {
	delete this._documentation[name];
	return delete this[name];
};


ApiCore.prototype.getDocumentation = function() {
	return this._documentation;
};



