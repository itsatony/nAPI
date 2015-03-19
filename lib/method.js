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
	this._specifiers[name] = { name: name, layers: layers };
	// force applying the api scope and create a new specifier instance for each call
	this[name] = this._wrapSpecifierInstance(name);
	this.emit('addSpecifier', this._specifiers[name], this);
	return this[name];
};


Method.prototype._wrapSpecifierInstance = function(name) {
	var thisMethod = this;
	return function() {
		var parameters = [];
		for (var n in arguments) {
			parameters.push(arguments[n]);
		}
		var specifier = new Specifier(name, thisMethod, thisMethod._specifiers[name].layers);
		specifier.executor.apply(specifier, parameters);
	};
};