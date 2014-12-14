var EventEmitter = require('events').EventEmitter;
var util = require('util');
var List = require(__dirname + '/list');
var Layer = require(__dirname + '/layer');


var ApiCall = function(name, parent, req, res, callback) {
	// identifier
	this._name = name;
	this._parent = parent;
	this._type = 'ApiCall';
	// from paramters
	this._req = req;
	this._res = res;
	this._callback = callback;
	// calculated
	this._data = {};
	this._data.startTime = Date.now();
	// prepared and filled by call unifier
	this._data.user = {
		_id: -1,
		isVirtual: true
	};
	this._data.method = req.method;
	this._data.resource = req.resource;
	this._data.resourceVersion = req.resourceVersion;
	this._data.specifier = req.specifier;
	this._data.results = {};
	this._data.errors = {};
	this._data.warnings = {};
	this._data.document = {};
	this._data.options = {};
	// systemic
	this._layers = {};
	this._steps = new List();
	this._init();
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


ApiCall.prototype._addLayer = function(name, next, func) {
	this._layers[name] = new Layer(name, this, next);
	if (typeof func === 'function') {
		this._layers[name]._define(func);
	}
	this[name] = this._layers[name].executor; // .bind(this._layers[name])
	return this[name];
};


ApiCall.prototype._init = function() {
	var layerName = 'none';
	var defaultApiLayers = [ 'auth', 'specifier', 'answer', 'propagate' ];
	for (var i=0; i<defaultApiLayers.length; i+=1) {
		layerName = defaultApiLayers[i];
		this._addLayer(layerName, this._nextStep);
		this._steps.add(layerName, this[layerName]);
	}
	return this;
};


ApiCall.prototype._nextStep = function() {
	var nextStep = this._steps.getNext();
	this.emit('nextStep', nextStep, this);
	return nextStep.executor();
};


ApiCall.prototype.run = function() {
	this.emit('run', this);
	return this._nextStep();
};

