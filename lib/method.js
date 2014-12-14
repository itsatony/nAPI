var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Specifier = require(__dirname + '/specifier');


var Method = function(name, parent) {
	this._parent = parent;
	this._name = name;
	this._type = 'Method';
	this._specifiers = {};
};
util.inherits(Method, EventEmitter);
module.exports = Method;


Method.prototype._addSpecifier = function(name, layers) {
	this._specifiers[name] = new Specifier(name, this, layers);
	// force applying the api scope
	this[name] = this._specifiers[name].executor.bind(this._specifiers[name]);
	this.emit('addSpecifier', this._specifiers[name], this);
	return this[name];
};

