module.exports = Specifier;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var List = require('list');
var Layer = require('layer');


var Specifier = function(name, parent, layers) {
	this.parent = parent;
	this._type = 'Specifier';
	this.name = name;
	this._layers = {};
	this._steps = new List();
	// usually: 'allow', 'logic', 'action3', 'filter'
	for (var layerName in layers) {
		this._addLayer(layerName, this._nextStep, layers[layerName]);
		this._steps.add(layerName, this._layers[layerName]);
	}
};
util.inherits(Specifier, EventEmitter);


Specifier.prototype._addLayer = function(name, next, func) {
	this._layers[name] = new Layer(name, this, next);
	if (typeof func === 'function') {
		this._layers[name]._define(func);
	}
	this.executor[name] = this._layers[name].executor; 
	return this[name];
};


Specifier.prototype.executor = function() { // document, options, callback
	console.log('running specifier ' + this.parent.parent.name + '.' + this.parent.name + '.' + this.name);
	this.emit('run', arguments, this);
	this._nextStep.apply(this, arguments);
};


Specifier.prototype._nextStep = function() {	
	var nextStep = this._steps.getNext();
	var prefixArguments = [ this.parent.parent, this._nextStep ].concat(arguments);
	this.emit('nextStep', prefixArguments, this);
	// console.log('running _nextStep-----------------------------------------');
	// console.log(nextStep);
	return nextStep._func.call(prefixArguments);
};

