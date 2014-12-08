module.exports = Resource;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Adaptor = require('adaptor');
var Method = require('method');


var Resource = function(name, parent, adaptorConfigs) {
	this.name = name;
	this._type = 'Resource';
	this.parent = parent;
	this.adaptors = {};
	if (adaptorConfigs instanceof Array === false) {
		adaptorConfigs = [ adaptorConfigs ];
	}
	for (var i=0; i<adaptorConfigs.length; i+=1) {
		this._setAdaptor(new Adaptor(this.name + '_' + adaptorConfigs[i].type, this, adaptorConfigs[i]));
	}
	this._addMethod('get');
	this._addMethod('put');
	this._addMethod('post');
	this._addMethod('delete');
};
util.inherits(Resource, EventEmitter);


Resource.prototype._addMethod = function(name) {
	this[name] = new Method(name, this);
	return this[name];
};


Resource.prototype._setAdaptor = function(adaptor) {
	this.adaptors[adaptor.name] = adaptor;
	this.emit('setAdaptor', adaptor, this);
	return this;
};

