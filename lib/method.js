var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Specifier = require(__dirname + '/specifier');


var Method = function(name, parent) {
	this._parent = parent;
	this._name = name.toLowerCase();
	this._type = 'Method';
	this._specifiers = {};
};
util.inherits(Method, EventEmitter);
module.exports = Method;


Method.prototype._addSpecifier = function(name, layers, description, parameters, tests) {
	name = name.toLowerCase();
	parameters = parameters || {};
	description = description || '';
	this._parent._parent._documentation[this._parent._name][this._name][name] = {
		description: description,
		parameters: {
			description: parameters.description || 'not described',
			optional: parameters.optional || false,
			type: parameters.type || 'string',
			example: parameters.example || 'example'			
		}
	};
	this._specifiers[name] = { name: name, layers: layers, description: description, parameters: parameters, tests: tests || [] };
	// force applying the api scope and create a new specifier instance for each call
	this[name] = this._wrapSpecifierInstance(name);
	this[name].runTest = this._wrapSpecifierInstanceTest(name);
	this.emit('addSpecifier', this._specifiers[name], this);
	return this;
};


Method.prototype._wrapSpecifierInstance = function(name) {
	var thisMethod = this;
	return function() {
		var parameters = [];
		for (var n in arguments) {
			parameters.push(arguments[n]);
		}
		var specifier = new Specifier(name, thisMethod, thisMethod._specifiers[name].layers, thisMethod._specifiers[name].parameters, thisMethod._specifiers[name].tests);
		specifier.executor.apply(specifier, parameters);
	};
};


Method.prototype._wrapSpecifierInstanceTest = function(name) {
	var thisMethod = this;
	return function() {
		var parameters = [];
		for (var n in arguments) {
			parameters.push(arguments[n]);
		}
		var specifier = new Specifier(name, thisMethod, thisMethod._specifiers[name].layers, thisMethod._specifiers[name].parameters, thisMethod._specifiers[name].tests);
		specifier._runTest.apply(specifier, parameters);
	};
};

