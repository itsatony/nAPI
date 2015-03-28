var EventEmitter = require('events').EventEmitter;
var util = require('util');
var List = require(__dirname + '/list');
var Layer = require(__dirname + '/layer');
var ApiCall = require(__dirname + '/apicall');


var Specifier = function(name, parent, steps) {
	var thisSpecifier = this;
	this._name = name.toLowerCase();
	this._parent = parent;
	this._apicore = parent._parent._parent;
	this._type = 'Specifier';
	this._layers = {};
	this._steps = new List();
	this.apiCall = null;
	var layerName = '';
	var stepCall = null;
	for (var n=0; n<steps.length; n+=1) {
		layerName = steps[n][0];
		stepCall = steps[n][1];
		this._addLayer(layerName, this._nextStep, stepCall);
		this._steps.add(layerName, this.executor[layerName]);
	}
};
util.inherits(Specifier, EventEmitter);
module.exports = Specifier;


Specifier.prototype.executor = function(document, options, callback) { // 
	var parameters = [];
	for (var n in arguments) {
		parameters.push(arguments[n]);
	}
	console.log('running specifier ' + this._parent._parent._name + '.' + this._parent._name + '.' + this._name);
	this.apiCall = new ApiCall(
		this._name + '_' + Date.now() + '_' + Math.floor(Math.random()*1000000), 
		this, 
		{
			resource: this._parent._parent._name, 
			resourceVersion: this._parent._parent._version, 
			method: this._parent._name,
			specifier: this._name,
			document: document,
			options: options
		},
		null, //console.log,
		callback
	);
	this.on(
		'finished',
		this.apiCall._complete.bind(this.apiCall)
	);
	this.emit('run', parameters, this);
	this._nextStep(null, null);
};


Specifier.prototype._addLayer = function(layerName, next, func) {
	this._layers[layerName] = new Layer(layerName, this, next);
	if (typeof func === 'function') {
		this._layers[layerName]._define(func);
	}
	this.executor[layerName] = wrapLayerExecutor(layerName, this); 
	return this.executor[layerName];
};


function wrapLayerExecutor(layerName, thisSpecifier) {
	var f = function() {
		var parameters = [ thisSpecifier._layers[layerName], thisSpecifier, thisSpecifier._nextStep.bind(thisSpecifier) ];
		thisSpecifier._layers[layerName].executor.apply(thisSpecifier.apiCall, parameters);
	};
	f.name = layerName;
	return f;
};



Specifier.prototype._nextStep = function(err, results) {
	var thisSpecifier = this;
	var next = null;
	if (typeof err !== 'undefined' && err !== null) {
		this.apiCall.set('errors', err);
	}
	if (typeof results !== 'undefined' && results !== null) {
		this.apiCall.set('results', results);	
	}
	var nextStep = this._steps.getNext();
	if (nextStep === null) {
		console.log('-> nextStep -----------------------------------------[finished]');
		return this.emit('finished', this);
	}
	this.emit('nextStep', this);
	next = this._nextStep.bind(this);
	console.log('-> nextStep -----------------------------------------[' + nextStep.name + ']');
	return nextStep.item();  
};

