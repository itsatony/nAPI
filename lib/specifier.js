var EventEmitter = require('events').EventEmitter;
var util = require('util');
var List = require(__dirname + '/list');
var Layer = require(__dirname + '/layer');


var Specifier = function(name, parent, layers) {
	this._name = name;
	this._parent = parent;
	this._type = 'Specifier';
	this._layers = {};
	this._steps = new List();
	// usually: 'allow', 'logic', 'action3', 'filter'
	for (var layerName in layers) {
		this._addLayer(layerName, this._nextStep, layers[layerName]);
		this._steps.add(layerName, this._layers[layerName]);
	}
};
util.inherits(Specifier, EventEmitter);
module.exports = Specifier;


Specifier.prototype._addLayer = function(_name, next, func) {
	this._layers[_name] = new Layer(_name, this, next);
	if (typeof func === 'function') {
		this._layers[_name]._define(func);
	}
	this.executor[_name] = this._layers[_name].executor; 
	return this[_name];
};


Specifier.prototype.executor = function() { // document, options, callback
	console.log('running specifier ' + this._parent._parent._name + '.' + this._parent._name + '.' + this._name);
	this.emit('run', arguments, this);
	this._nextStep.apply(this, arguments);
};


Specifier.prototype._nextStep = function() {	
	var nextStep = this._steps.getNext();
	var prefixArguments = [ this._parent._parent, this._nextStep ].concat(arguments);
	this.emit('nextStep', prefixArguments, this);
	// console.log('running _nextStep-----------------------------------------');
	// console.log(nextStep);
	return nextStep._func.call(prefixArguments);
};

