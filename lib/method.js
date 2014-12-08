module.exports = Method;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Specifier = require('specifier');


var Method = function(name, parent) {
	this.parent = parent;
	this.name = name;
	this._specifiers = {};
};
util.inherits(Method, EventEmitter);


Method.prototype._addSpecifier = function(name, layers) {
	this._specifiers[name] = new Specifier(name, this, layers);
	// force applying the api scope
	this[name] = this._specifiers[name].executor.bind(this._specifiers[name]);
	this.emit('addSpecifier', this._specifiers[name], this);
	return this[name];
};

