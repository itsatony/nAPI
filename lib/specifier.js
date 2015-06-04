var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Test = require(__dirname + '/test');
var List = require(__dirname + '/list');
var Layer = require(__dirname + '/layer');
var ApiCall = require(__dirname + '/apicall');


var Specifier = function(name, parent, steps, parameters, tests) {
	var thisSpecifier = this;
	this._name = name.toLowerCase();
	this._parent = parent;
	this._parameters = parameters;
	this._apicore = parent._parent._parent;
	this._type = 'Specifier';
	this._layers = {};
	this._data = {};
	this._debug = false;
	this._steps = new List();
	this.apiCall = null;
	this._finishOnError = true;
	this._tests = [];
	if (tests instanceof Array) {
		for (var t = 0; t<tests.length; t+=1) {
			if (typeof tests[t] === 'object' && typeof tests[t].name === 'string' && typeof tests[t].parameters !== 'undefined' && typeof tests[t].validate === 'function') {
				this._tests.push(new Test(thisSpecifier, tests[t].name, tests[t].parameters, tests[t].validate));
			}
		}
	}
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


Specifier.prototype.set = function(key, value) {
	this._data[key] = (typeof value === 'undefined') ? null : value;
	this.emit('set', this._data[key], this);
	return this;
};

Specifier.prototype.get = function(key) {
	return (typeof this._data[key] === 'function') ? this._data[key]() : this._data[key];
};

Specifier.prototype._validateParameters = function(document) {
	var okay = true;
	var error = null;
	// console.log('PARAMETERS: ', this._parameters, document);
	for (var n in this._parameters) {
		if (this._parameters[n].__optional !== true) {
			if (typeof document[n] === 'undefined') {
				okay = false;
				error = new Error('needed parameter not provided: ' + n);
				break;
			}
		}
		if (typeof document[n] !== 'undefined') {
			if (typeof this._parameters[n].__validate === 'function') {
				error = this._parameters[n].__validate(document[n]);
				if (error instanceof Error === true) {
					okay = false;
					break;
				}
			}
		}		
	}
	return error;
};


Specifier.prototype.executor = function(document, options, callback, callOptions) { // 
	var thisSpecifier = this;
	this.set('callPath', this._parent._parent._name + '.' + this._parent._name + '.' + this._name);
	var callPath = this.get('callPath');
	if (typeof callOptions !== 'object' || callOptions === null) {
		callOptions = {};
	}
	var parameters = [];
	for (var n in arguments) {
		parameters.push(arguments[n]);
	}
	this._debug = (typeof callOptions.debug === 'boolean') ? callOptions.debug : false;
	if (this._debug === true) {
		console.log('->[specifier debug @ ' + callPath + '.init] started.');
	}
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
	if (typeof callOptions.user === 'object') {
		console.log('set apiCall user ' + callOptions.user._id);
		this.apiCall.set('user', callOptions.user);
	}
	this.on(
		'finished',
		function() {
			var args = [];
			for (var i in arguments) {
				args.push(arguments[i]);
			}
			thisSpecifier._apicore.emit('specifierFinished', thisSpecifier);
			thisSpecifier.apiCall._complete.apply(thisSpecifier.apiCall, args);
		}
	);
	var parametersValid = this._validateParameters(document);
	this.emit('run', parameters, this);
	this._nextStep(parametersValid, null);
	return true;
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
	var activeStepName = thisSpecifier._steps.getLast();
	var callPath = thisSpecifier.get('callPath');
	var next = null;
	if (typeof err !== 'undefined' && err !== null) {
		thisSpecifier.apiCall.set('errors', err);
		if (thisSpecifier._finishOnError === true) {
			return thisSpecifier.emit('finished', thisSpecifier);
		}
	}
	if (typeof results !== 'undefined' && results !== null) {
		thisSpecifier.apiCall.set('results', results);	
	}
	if (thisSpecifier._debug === true) {
		var e = thisSpecifier.apiCall.get('errors');
		var r = thisSpecifier.apiCall.get('results');
		if (r === null) r = [];
		// console.log('->[specifier debug @ ' + callPath + '.' + activeStepName + '] err ------------------', err);
		// console.log('->[specifier debug @ ' + callPath + '.' + activeStepName + '] results --------------', results);
		console.log('->[specifier debug @ ' + callPath + '.' + activeStepName + '] apiCall err, res.length -----------', e, r.length || null);
	}
	var nextStep = thisSpecifier._steps.getNext();
	if (nextStep === null) {
		if (thisSpecifier._debug === true) {
			console.log('->[specifier debug @ ' + callPath + '.' + activeStepName + '] nextStep ---------------------[finished]');
		}
		return thisSpecifier.emit('finished', thisSpecifier);
	}
	thisSpecifier.emit('nextStep', thisSpecifier);
	next = thisSpecifier._nextStep.bind(thisSpecifier);
	if (thisSpecifier._debug === true) {
		console.log('->[specifier debug @ ' + callPath + '.' + activeStepName + '] nextStep -----------[' + nextStep.name + ']');
	}
	return nextStep.item();  
};

 
Specifier.prototype._runTest = function(name, callback) {
	var test = null;
	for (var n=0;n<this._tests.length;n+=1) {
		if (this._tests[n]._name === name) {
			test = this._tests[n];
			break;
		}
	}
	if (test !== null) {
		// console.log('running test ' + name);
		return test.run(callback);
	} else {
		// console.log('test not found!', this._tests);
	}
	return false;
};

