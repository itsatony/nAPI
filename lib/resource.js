var q = require('q');
var Promise = q.Promise;
var Adaptors = require(__dirname + '/adaptors');
var Method = require(__dirname + '/method');
var Model = require(__dirname + '/model');
var MetaEvents = require(__dirname + '/metaEvents.js');

function ResourceWrapper(name, api, adaptorConfigs, model) {
	return Promise(
		function(resolve, reject, notify) {
			var newResource = new Resource(name, api, adaptorConfigs, model, resolve, reject, notify);
			return newResource;
		}
	);
};
module.exports = ResourceWrapper;


var Resource = function(name, api, adaptorConfigs, model, resolve, reject, notify) {
	var thisResource = this;
	this._name = name.toLowerCase();
	this._type = 'Resource';
	this._api = api;
	this._data = {
		model: (typeof model === 'object' && model !== null) 
			? model
			: new Model(),
		version: '1.0.0'
	}
	this.events = MetaEvents('{napi.resource}' + name);
	this._adaptors = {};
	if (Array.isArray(adaptorConfigs) === false) {
		adaptorConfigs = [ adaptorConfigs ];
	}
	this._addMethod('get');
	this._addMethod('put');
	this._addMethod('post');
	this._addMethod('delete');
	var adaptorPromises = [];
	for (var i=0; i < adaptorConfigs.length; i+=1) {
		adaptorPromises.push(this._setAdaptor(adaptorConfigs[i]));
	}
	return q.allSettled(
		adaptorPromises
	).then(
		function() {
			thisResource.events.metaEmit('ready', thisResource);
			return resolve(thisResource);
		}
	).catch(
		function(err) { 
			return reject(err);
		}
	);
};


Resource.prototype._addMethod = function(name) {
	var thisResource = this;
	name = name.toLowerCase();
	this._api._documentation[this._name][name] = {};
	this[name] = Method(name, this);
	thisResource.events.metaEmit('addMethod', this[name]);
	return this[name];
};


Resource.prototype._setAdaptor = function(config) {
	var thisResource = this;
	return Promise(
		function(resolve, reject) {
			Adaptors[config.name].init(
				config
			).then(
				function(adaptor) {
					thisResource._adaptors[config.name] = adaptor;
					thisResource.events.metaEmit('setAdaptor', adaptor);
					return resolve(adaptor);
				}
			).catch(
				function(err) {
					return reject(err);
				}
			);
		}
	);
};


Resource.prototype._set = function(key, value) {
	this._data[key] = value;
	this.events.metaEmit('set', this._data[key], this);
	return this;
};


Resource.prototype._get = function(key) {
	return this._data[key];
};
