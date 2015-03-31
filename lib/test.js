// var EventEmitter = require('events').EventEmitter;
// var util = require('util');
var Q = require('q');
var expect = require('expect.js');

var Test = function(parent, name, getParameters, validate) {
	this._parent = parent;
	this._type = 'Test';
	this._name = name;
	this._getParameters = getParameters;
	this._validate = validate;
};
// util.inherits(Test, EventEmitter);
module.exports = Test;


Test.prototype.run = function(callback) {
	var thisTest = this;
	var parameters = (typeof this._getParameters === 'function') 
		? this._getParameters(this._parent, this)
		: this._getParameters
	;
	this._parent.executor(
		parameters.document, 
		parameters.options, 
		function(errors, results) {
			var testErrors = null;
			var args = [];
			for (var n in arguments) {
				args.push(arguments[n]);
			}
			try {
				thisTest._validate({ errors: errors, results: results });
			} catch(err) {
				testErrors = err;
			}
			args.unshift(thisTest._name);
			args.unshift(testErrors);
			if (typeof callback === 'function') {
				callback.apply(callback, args);
			}
		}
	);
	return true;
};

