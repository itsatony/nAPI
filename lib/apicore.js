var q = require('q');
var Promise = q.Promise;
var Resource = require(__dirname + '/resource');
var ApiCall = require(__dirname + '/apicall');
var MetaEvents = require(__dirname + '/metaEvents.js');

function ApiCoreWrapper(name, config) {
	return Promise(
		function(resolve, reject, notify) {
			try {
				var newApiCore = new ApiCore(name, config, resolve, reject, notify);
				return resolve(newApiCore);
			} catch(err) {
				return reject(err);
			}
		}
	);
};

module.exports = ApiCoreWrapper;

var ApiCore = function(name, config, resolve, reject, notify) {
	this.events = MetaEvents('{napi.core}.' + name);
	this._name = name;
	this._type = 'NApi';
	this._resources = {};
	this._config = config;
	this._apicalls = {};
	this._documentation = {		
	};
};


ApiCore.prototype._addResource = function(name, config, model) {
	var thisApiCore = this;
	name = name.toLowerCase();
	this._documentation[name] = {};
	return Resource(
		name, 
		thisApiCore, 
		config, 
		model
	).then(
		function(theNewResource) {
			thisApiCore._resources[name] = theNewResource;
			thisApiCore[name] = thisApiCore._resources[name];
			thisApiCore.events.metaEmit('addResource', thisApiCore[name]);
			return theNewResource;
		}
	).catch(
		function(err) {
			// console.error('API CORE FAILED addResource ' + name);
			// console.error(err.stack || err);
			// return process.exit(1);
			throw err;
		}
	);
};


ApiCore.prototype._removeResource = function(name) {
	delete this._documentation[name];
	thisApiCore.events.metaEmit('removeResource', thisApiCore[name]);
	return delete this[name];
};


ApiCore.prototype.getDocumentation = function() {
	return this._documentation;
};
ApiCore.prototype.help = function() {
	return this.getDocumentation();
};


ApiCore.prototype._checkRMS = function(resource, method, specifier) {
	var thisApiCore = this;
	var result = true;
	if (typeof this[resource] === 'undefined') {
		result = new Error('resource {' + resource + '} unknown.');
	} else if (typeof thisApiCore[resource][method] === 'undefined') {
		result = new Error('method {' + method + '} for resource [' + resource + '] unknown.');
	} else if (typeof thisApiCore[resource][method][specifier] === 'undefined') {
		result = new Error('specifier {' + specifier + '} for resource [' + resource + '] and method [' + method + '] unknown.');
	}
	thisApiCore.events.metaEmit('checkRMS', resource, method, specifier, result);
	return result;
};


ApiCore.prototype.run = function(resource, method, specifier, document, options, callOptions) {
	var thisApiCore = this;
	resource = resource.toLowerCase();
	method = method.toLowerCase();
	specifier = specifier.toLowerCase();
	if (
		typeof resource !== 'string'
		|| typeof specifier !== 'string'
		|| typeof method !== 'string'
		|| typeof document !== 'object'
		|| typeof options !== 'object'
	) {
		var error = new Error('you need to supply these arguments: resource, method, specifier, document, options, callOptions [optional]');
		thisApiCore.events.metaEmit('run', arguments, error);
		return error;
	}
	var exists = this._checkRMS(resource, method, specifier);
	if (exists !== true) {
		return exists;
	}
	var result = this[resource][method][specifier](document, options, callOptions);
	thisApiCore.events.metaEmit('run', arguments, result);
	return result;
};



