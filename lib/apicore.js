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


ApiCore.prototype._addResource = function(name, config, model, callback) {
	name = name.toLowerCase();
	this._documentation[name] = {};
	this._resources[name] = new Resource(name, this, config, model, callback);
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
ApiCore.prototype.help = function() {
	return this.getDocumentation();
};


ApiCore.prototype._checkRMS = function(resource, method, specifier) {
	if (typeof this[resource] === 'undefined') {
		return new Error('resource {' + resource + '} unknown.');
	} else if (typeof api[resource][method] === 'undefined') {
		return new Error('method {' + method + '} for resource [' + resource + '] unknown.');
	} else if (typeof api[resource][method][specifier] === 'undefined') {
		return new Error('specifier {' + specifier + '} for resource [' + resource + '] and method [' + method + '] unknown.');
	}
	return true;
};

ApiCore.prototype.run = function(resource, method, specifier, document, options, callback, callOptions) {
	resource = resource.toLowerCase();
	method = method.toLowerCase();
	specifier = specifier.toLowerCase();
	if (
		typeof resource !== 'string'
		|| typeof specifier !== 'string'
		|| typeof method !== 'string'
		|| typeof document !== 'object'
		|| typeof options !== 'object'
		|| typeof callback !== 'function'
	) {
		return new Error('you need to supply these arguments: resource, method, specifier, document, options, callback');
	}
	var exists = this._checkRMS(resource, method, specifier);
	if (exists !== true) {
		return exists;
	}
	return this[resource][method][specifier](document, options, callback, callOptions);
};



