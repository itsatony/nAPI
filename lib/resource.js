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
	this._methods = 'Resource';
	this._api = api;
	this._data = {
		model: (typeof model === 'object' && model !== null)
			? model
			: new Model(),
		version: '1.0.0'
	}
	this.events = MetaEvents('{napi.resource}.' + name);
	this.events.forwardTo(this._api.events);
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
		function(results) {
			for (var i=0; i<results.length; i+=1) {
				if (results[i].state !== 'fulfilled') {
					return reject(results[i]);
				}
			}
			thisResource.events.metaEmit('ready', thisResource);
			return resolve(thisResource);
		}
	).catch(
		function(err) {
			// console.log('===== RESOURCE ADAPTOR INIT ERROR ======== ', err);
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
	// console.log('_setAdaptor ____ 0');
	return Promise(
		function(resolve, reject) {
			// console.log('_setAdaptor ____ 1');
			Adaptors[config.name].init(
				config
			).then(
				function(adaptor) {
					// console.log('_setAdaptor ____ RESOLVE');
					thisResource._adaptors[config.name] = adaptor;
					thisResource.events.metaEmit('setAdaptor', adaptor);
					return resolve(adaptor);
				},
				function(err) {
					// console.log('_setAdaptor ____ REJECT');
					return reject(err);
				}
			).catch(
				function(err) {
					// console.log('_setAdaptor ____ ERROR');
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
