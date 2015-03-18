var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Adaptor = require(__dirname + '/adaptor');
var Method = require(__dirname + '/method');


var Resource = function(name, parent, adaptorConfigs) {
	this._name = name;
	this._type = 'Resource';
	this._parent = parent;
	this._adaptors = {};
	this._version = '1.0.0';
	if (adaptorConfigs instanceof Array === false) {
		adaptorConfigs = [ adaptorConfigs ];
	}
	for (var i=0; i<adaptorConfigs.length; i+=1) {
		this._setAdaptor(new Adaptor(this._name + '_' + adaptorConfigs[i].type, this, adaptorConfigs[i]));
	}
	this._addMethod('get');
	this._addMethod('put');
	this._addMethod('post');
	this._addMethod('delete');
};
util.inherits(Resource, EventEmitter);
module.exports = Resource;


Resource.prototype._addMethod = function(name) {
	this[name] = new Method(name, this);
	return this[name];
};


Resource.prototype._setAdaptor = function(adaptor) {
	this._adaptors[adaptor._name] = adaptor;
	this.emit('setAdaptor', adaptor, this);
	return this;
};

