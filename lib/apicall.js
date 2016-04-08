var MetaEvents = require(__dirname + '/metaEvents.js');
var q = require('q');
var Promise = q.Promise;


function ApiCallWrapper(name, specifier, steps, input) {
	var newApiCall = new ApiCall(name, specifier, steps, input);
	return newApiCall;
};
module.exports = ApiCallWrapper;


var ApiCall = function(name, specifier, steps, input) {
	// identifier
	var thisApiCall = this;
	this._name = name;
	this._status = 'created';
	this._specifier = specifier;
	this._method = specifier._method;
	this._resource = specifier._resource;
	this._steps = steps;
	this._api = specifier._api;
	this._type = 'ApiCall';
	this.events = MetaEvents('{napi.apiCall}.' + this._resource._name + '.' + this._method._name + '.' + this._specifier._name + '.' + name);
	this.events.forwardTo(this._specifier.events);
	// from parameters
	this._input = input;
	// calculated
	this._data = {};
	this._data.startTime = Date.now();
	// prepared and filled by call unifier
	this._data.user = null;
	this._data.method = input.method;
	this._data.resource = input.resource;
	this._data.resourceVersion = input.resourceVersion || '1.0.0';
	this._data.specifier = input.specifier;
	this._data.results = null;
	this._data.errors = null;
	this._data.warnings = {};
	this._data.document = input.document || {};
	this._data.options = input.options || {};
	this._data.adaptors = this._resource._adaptors;
	this._data.callPath = this._specifier.get('callPath');
	this._data.model = function() { return thisApiCall._resource._get('model') };
	this.events.metaEmit('created', this);
};


ApiCall.prototype.set = function(key, value) {
	this._data[key] = (typeof value === 'undefined') ? null : value;
	if (key === 'user') {
		log.warn('[[{{{{//// user set for apiCall {' + this._data.callPath + '}  [' + value.email + ']  (' + value._id +')');
	}
	this.events.metaEmit('set', this._data[key], this);
	return this;
};


ApiCall.prototype.get = function(key) {
	return (typeof this._data[key] === 'function') ? this._data[key]() : this._data[key];
};


ApiCall.prototype.executor = function() {
	var thisApiCall = this;
	return stepChainPromises(
		this, this._specifier._steps
	)();
};


function stepChainPromises(apiCall, list) {
	return function() {
		var specifier = apiCall._specifier;
		var document = specifier.get('executorDocument');
		var parameters = specifier.get('executorParameters');
		var parametersValid =
			(
				typeof callOptions === 'object' && callOptions !== null &&
				(typeof callOptions.noParameterValidation !== 'boolean' || callOptions.noParameterValidation !== true)
			)
			?
				specifier._validateParameters(document)
			:
				true
		;

		return Promise(
			function(chainResolve, chainReject, chainNotify) {
				var eHandler = function(err) {
					return chainReject(err);
				};
				var result = q('apiCall.steps.init').catch(
					eHandler
				);
				list.unshift(
					{
						name: 'apiCall.steps.start',
						resolveHandler: function() {
							return function() {
								return Promise(
									function(resolve, reject, notify) {
										chainNotify('start');
										apiCall.events.metaEmit('start', parameters, specifier);
										resolve(apiCall);
										return apiCall;
									}
								);
							}
						}
					}
				);
				list.push(
					{
						name: 'apiCall.steps.end',
						resolveHandler: function() {
							return function() {
								return Promise(
									function(resolve, reject, notify) {
										chainNotify('end');
										var results = apiCall.get('results');
										var errors = apiCall.get('errors');
										apiCall.events.metaEmit('finished', apiCall.specifier);
										resolve(apiCall);
										//chainResolve(results);
										chainResolve(apiCall);
										return results;
									}
								);
							}
						}
					}
				);
				list.forEach(
					function (listItem) {
						function emitNextStep(step) {
							return function() {
								return apiCall.events.metaEmit('nextStep', step.name, step);
							}
						};
						if (typeof listItem.rejectStep === 'function') {
							return result = result.then(listItem.resolveHandler(apiCall), listItem.rejectHandler(apiCall)).catch(eHandler);
						} else {
							chainNotify('starting: ' + listItem.name);
							return result = result.then(emitNextStep(listItem)).then(listItem.resolveHandler(apiCall)).catch(eHandler);
						}
					}
				);
				return result;
			}
		);
	}
};
