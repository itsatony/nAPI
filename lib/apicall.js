var EventEmitter = require('events').EventEmitter;
var util = require('util');


var ApiCall = function(name, parent, input, outlet, callback) {
	// identifier
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
	this._data.results = null;
	this._data.errors = null;
	this._data.warnings = {};
	this._data.document = input.document || {};
	this._data.options = input.options || {};
	this._data.adaptors = parent._parent._parent._adaptors;
	this.emit('created', this);
};
util.inherits(ApiCall, EventEmitter);
module.exports = ApiCall;


ApiCall.prototype.set = function(key, value) {
	this._data[key] = value;
	this.emit('set', this._data[key], this);
	return this;
};


ApiCall.prototype.get = function(key) {
	return this._data[key];
};


ApiCall.prototype.getBaseResource = function() {
	return this._parent._parent._parent;
};


ApiCall.prototype._complete = function() {
	// console.log('COMPLETE ++++++++++++++++++++++');
	this._status = 'complete';
	if (typeof this._callback === 'function') {
		this._callback(this._data.errors, this._data.results, this);
	}
	if (typeof this._outlet === 'function') {
		this._outlet(this._data.errors, this._data.results, this);
	}
	return true;
};

