module.exports = Layer;

var EventEmitter = require('events').EventEmitter;
var util = require('util');


var Layer = function(name, parent, next) {
	this.parent = parent;
	this._type = 'Layer';
	this.name = name;
	this.next = next;
};
util.inherits(Layer, EventEmitter);


Layer.prototype._func = function() {
	// just a default execution function to show that the layer was called
	console.log('LAYER ' + this.name);
	return this.next();
};


Layer.prototype.executor = function() {
	// execute from the Specifier perspective, but provide the ApiCall as first Argument
	console.log('Layer.executor', this);
	var prefixArguments = [ this.parent ].concat(arguments);
	this.emit('run', this._func, this);
	return this._func.call(prefixArguments);
};


Layer.prototype._define = function(func) {
	this._func = func;
	this.emit('define', this._func, this);
	return this._func;
};

