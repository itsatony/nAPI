var EventEmitter = require('events').EventEmitter;
var util = require('util');


var Layer = function(name, parent, next) {
	this._parent = parent;
	this._type = 'Layer';
	this._name = name;
	this.next = next;
};
util.inherits(Layer, EventEmitter);
module.exports = Layer;


Layer.prototype._func = function() {
	// just a default execution function to show that the layer was called
	console.log('LAYER ' + this._name);
	return this.next();
};


Layer.prototype.executor = function(thisLayer, specifier, next) {
	// execute from the Specifier perspective, but provide the ApiCall as first Argument
	console.log('=======>>>>>>>>>> Layer.executor - apiCall', this);
	var parameters = [ ];
	for (var n in arguments) {
		parameters.push(arguments[n]);
	}
	thisLayer.emit('run', thisLayer._func, thisLayer);
	return thisLayer._func.apply(this, parameters);
};


Layer.prototype._define = function(func) {
	this._func = func;
	this.emit('define', this._func, this);
	return this._func;
};

