var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Promise = require('q').Promise;


var ApiCall = function(name, parent, input, outlet, callback) {
	// identifier
	var thisApiCall = this;
	this._name = name;
	this._status = 'created';
	this._parent = parent;
	this._type = 'ApiCall';
	// from parameters
	this._input = input;
	this._outlet = outlet;
	this._callback = callback;
	// calculated
	this._data = {};
	this._data.startTime = Date.now();
	// prepared and filled by call unifier
	this._data.user = {
		_id: -1,
		isVirtual: true
	};
	this._data.method = input.method;
	this._data.resource = input.resource;
	this._data.resourceVersion = input.resourceVersion || '1.0.0';
	this._data.specifier = input.specifier;
	this._data.results = [];
	this._data.errors = null;
	this._data.warnings = {};
	this._data.document = input.document || {};
	this._data.options = input.options || {};
	this._data.adaptors = parent._parent._parent._adaptors;
	this._data.baseResource = this._parent._parent._parent;
	this._data.api = this._parent._parent._parent._parent;
	this._data.callPath = this._data.resource + '.' + this._data.method + '.' + this._data.specifier;
	this._data.model = function() { return thisApiCall._parent._parent._parent._get('model') };
	this.emit('created', this);
	this._promise = Q.Promise(
		function(resolve, reject, notify) {
			thisApiCall.on(
				'complete',
				function() {
					var errors = thisApiCall.get('errors');
					if (errors !== null) {
						return reject(errors);
					}
					var results = thisApiCall.get('results');
					return resolve(results);
				}
			);
		}
	);
};
util.inherits(ApiCall, EventEmitter);
module.exports = ApiCall;


ApiCall.prototype.set = function(key, value) {
	this._data[key] = (typeof value === 'undefined') ? null : value;
	this.emit('set', this._data[key], this);
	return this;
};


ApiCall.prototype.get = function(key) {
	return (typeof this._data[key] === 'function') ? this._data[key]() : this._data[key];
};


ApiCall.prototype._complete = function() {
	// console.log('COMPLETE ++++++++++++++++++++++', this._callback.toString());
	this._status = 'complete';
	this.emit('complete', this);
	if (typeof this._callback === 'function') {
		this._callback(this._data.errors, this._data.results, this);
	}
	if (typeof this._outlet === 'function') {
		this._outlet(this._data.errors, this._data.results, this);
	}
	return true;
};

