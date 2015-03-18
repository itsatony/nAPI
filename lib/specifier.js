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
	this.apiCall = null;
	// usually: 'allow', 'logic', 'action3', 'filter'
	// TODO : make layers be a LIST
	var layerName = '';
	var stepCall = null;
	for (var n=0; n<steps.length; n+=1) {
		layerName = steps[n][0];
		stepCall = steps[n][1];
		// console.log('--> adding specifier layer : ', layerName);
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
	this.apiCall = new ApiCall(
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
		null, //console.log,
		parameters[2]
	);
	this.on(
		'finished',
		this.apiCall._complete.bind(this.apiCall)
	);
	this.emit('run', parameters, this);
	this._nextStep(null, null);
};


Specifier.prototype._nextStep = function(err, results) {
	if (typeof err !== 'undefined' && err !== null) {
		this.apiCall.set('errors', err);
	}
	if (typeof results !== 'undefined' && results !== null) {
		this.apiCall.set('results', results);	
	}
	var nextStep = this._steps.getNext();
	console.log(nextStep.toString());
	if (typeof nextStep === 'undefined') {
		return this.emit('finished', this);
	}
	this.emit('nextStep', this);
	console.log('running _nextStep-----------------------------------------', nextStep.name);
	// run a layer with parameters  specifier, NEXT function
	return nextStep.apply(this.apiCall, [ this, this._nextStep.bind(this) ]);  // , this._parent._parent, this._parent,  
};

