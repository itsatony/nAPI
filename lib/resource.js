var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Adaptors = require(__dirname + '/adaptors');
var Method = require(__dirname + '/method');
var async = require('async');

var Resource = function(name, parent, adaptorConfigs, model, callback) {
	this._name = name.toLowerCase();
	this._type = 'Resource';
	this._parent = parent;
	this._data = {
		model: model,
		version: '1.0.0'
	}
	this._adaptors = {};
	if (adaptorConfigs instanceof Array === false) {
		adaptorConfigs = [ adaptorConfigs ];
	}
	this._addMethod('get');
	this._addMethod('put');
	this._addMethod('post');
	this._addMethod('delete');
	// todo: replace async with q ?
	async.each(adaptorConfigs, this._setAdaptor.bind(this), callback);
};
util.inherits(Resource, EventEmitter);
module.exports = Resource;


Resource.prototype._addMethod = function(name) {
	name = name.toLowerCase();
	this._parent._documentation[this._name][name] = {};
	this[name] = new Method(name, this);
	return this[name];
};


Resource.prototype._setAdaptor = function(config, callback) {
	var thisResource = this;
	Adaptors[config.name].init(
		config, 
		function(err, db, collection) {
			// console.log('ADAPTOR CALLBACK', arguments); 
			// console.log('~~~ ADAPTOR ADDED: ' + config.name);
			thisResource._adaptors[config.name] = collection;
			thisResource.emit('setAdaptor', collection, thisResource);
			callback(err); 
		}
	)
	return this;
};


Resource.prototype._set = function(key, value) {
	this._data[key] = value;
	this.emit('set', this._data[key], this);
	return this;
};


Resource.prototype._get = function(key) {
	return this._data[key];
};
