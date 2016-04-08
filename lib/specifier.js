var Test = require(__dirname + '/test');
var List = require(__dirname + '/list');
var ApiCall = require(__dirname + '/apicall');
var q = require('q');
var MetaEvents = require(__dirname + '/metaEvents.js');

function SpecifierWrapper(name, method, steps, parameters, tests) {
	var newSpecifier = new Specifier(name, method, steps, parameters, tests);
	return newSpecifier;
};
module.exports = SpecifierWrapper;


var Specifier = function(name, method, steps, parameters, tests) {
	var thisSpecifier = this;
	this._name = name.toLowerCase();
	this._method = method;
	this._resource = method._resource;
	this._api = method._api;
	this._callPath = this._api._name + '.' + this._resource._name + '.' + this._method._name + '.' + this._name;
	this._type = 'Specifier';
	this._parameters = parameters;
	this._steps = [];
	this._data = {};
	this._debug = false;
	this._finishOnError = true;
	this.events = MetaEvents('{napi.specifier}.' + this._resource._name + '.' + this._method._name + '.' + name);
	this.events.forwardTo(this._method.events);
	this._tests = [];
	if (Array.isArray(tests) === true) {
		for (var t = 0; t<tests.length; t+=1) {
			if (
				typeof tests[t] === 'object'
				&& typeof tests[t].name === 'string'
				&& typeof tests[t].parameters !== 'undefined'
				&& typeof tests[t].validate === 'function'
			) {
				this._tests.push(new Test(thisSpecifier, tests[t].name, tests[t].parameters, tests[t].validate));
			}
		}
	}
	var StepName = '';
	var stepCall = null;
	for (var n=0; n<steps.length; n+=1) {
		if (!steps[n] || typeof steps[n].name !== 'string' || typeof steps[n].resolveHandler !== 'function') {
			var err = new Error('step ' + n + ' is not well-defined for specifier ' + thisSpecifier._name);
			throw err;
		}
		this._steps.push(steps[n]);
	}
};


Specifier.prototype.set = function(key, value) {
	this._data[key] = (typeof value === 'undefined') ? null : value;
	this.events.metaEmit('set', this._data[key], this);
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
	this.events.metaEmit('validateParameters', document, error);
	return error;
};


Specifier.prototype.executor = function(document, options, callOptions) {
	var thisSpecifier = this;
	var callPath = this.get('callPath');
	if (typeof callOptions !== 'object' || callOptions === null) {
		callOptions = {};
	}
	this.events.metaEmit('executor', callPath, document, options, callOptions);
	var apiCall = ApiCall(
		this._name + '_' + Date.now() + '_' + Math.floor(Math.random()*1000000),
		this,
		this._steps,
		{
			resource: this._resource._name,
			resourceVersion: this._resource._version,
			method: this._method._name,
			specifier: this._name,
			document: document,
			options: options
		}
	);

	if (typeof callOptions.debug === 'boolean') {
		apiCall.set('debug', callOptions.debug);
	}
	if (typeof callOptions.user === 'object') {
		if (this._debug === true) {
			console.log('[napi.specifier] set apiCall [' + this._name +'] user ' + callOptions.user._id);
		}
		apiCall.set('user', callOptions.user);
	}
	if (typeof callOptions.clientId === 'string') {
		if (this._debug === true) {
			console.log('[napi.specifier] set apiCall [' + this._name +'] clientId ' + callOptions.clientId);
		}
		apiCall.set('clientId', callOptions.clientId);
	}
	if (typeof callOptions.pause === 'boolean' && callOptions.pause === true) {
		return apiCall.executor;
	}
	return apiCall.executor();
};


Specifier.prototype._runTest = function(name, callback) {
	var test = null;
	for (var n=0;n<this._tests.length;n+=1) {
		if (this._tests[n]._name === name) {
			test = this._tests[n];
			break;
		}
	}
	this.events.metaEmit('runTest', name, test);
	if (test !== null) {
		// console.log('running test ' + name);
		return test.run(callback);
	} else {
		// console.log('test not found!', this._tests);
	}
	return false;
};
