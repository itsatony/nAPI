var EventEmitter = require('events').EventEmitter;
var util = require('util');
var List = require(__dirname + '/list');
var Layer = require(__dirname + '/layer');
var ApiCall = require(__dirname + '/apicall');


var Specifier = function(name, parent, steps) {
	var thisSpecifier = this;
	this._name = name;
	this._parent = parent;
	this._type = 'Specifier';
	this._layers = {};
	this._steps = new List();
	this._apiCall = null;
	// usually: 'allow', 'logic', 'action3', 'filter'
	// TODO : make layers be a LIST
	var layerName = '';
	var stepCall = null;
	for (var n=0; n<steps.length; n+=1) {
		layerName = steps[n][0];
		stepCall = steps[n][1];
		console.log('--> adding specifier layer : ', layerName);
		this._addLayer(layerName, this._nextStep, stepCall);
		this._steps.add(layerName, stepCall);
		this.executor[layerName] = wrapExecutor(layerName, thisSpecifier);
	}
};
util.inherits(Specifier, EventEmitter);
module.exports = Specifier;

function wrapExecutor(layerName, thisSpecifier) {
	return function() {
		console.log('myLayer = ' + layerName);
		stepCall.apply(thisSpecifier); // , [thisSpecifier._nextStep]
	};
};


Specifier.prototype._addLayer = function(_name, next, func) {
	this._layers[_name] = new Layer(_name, this, next);
	if (typeof func === 'function') {
		this._layers[_name]._define(func);
	}
	this.executor[_name] = this._layers[_name].executor; 
	return this[_name];
};


Specifier.prototype.executor = function() { // document, options, callback
	var parameters = [];
	for (var n in arguments) {
		parameters.push(arguments[n]);
	}
	console.log('running specifier ' + this._parent._parent._name + '.' + this._parent._name + '.' + this._name);
	this._apiCall = new ApiCall(
		this._name + '_' + Date.now() + '_' + Math.floor(Math.random()*1000000), 
		this, 
		{
			resource: this._parent._parent._name, 
			resourceVersion: this._parent._parent._version, 
			method: this._parent._name,
			specifier: this._name,
			document: parameters[0],
			options: parameters[1]
		},
		console.log,
		parameters[2]
	);
	this.on(
		'finished',
		this._apiCall._complete
	);
	this.emit('run', parameters, this);
	this._nextStep();
};


Specifier.prototype._nextStep = function() {	
	var nextStep = this._steps.getNext();
	if (typeof nextStep === 'undefined') {
		console.log('*** FINISHED***');
		return this.emit('finished', this);
	}
	// var parameters = [];
	// for (var n in arguments) {
		// parameters.push(arguments[n]);
	// }
	// make it  resource, next, specifier function call parameters
	// var prefixArguments = [ this._parent._parent, this._nextStep, parameters ];
	this.emit('nextStep', this);
	// console.log('prefixArguments-----------------------------------------');
	// console.log(prefixArguments);
	console.log('running _nextStep-----------------------------------------', nextStep.name);
	// console.log(nextStep.toString());
	return nextStep.apply(this._apiCall, [ this._nextStep.bind(this) ]);
};

