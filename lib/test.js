var Q = require('q');
var Promise = Q.Promise;
var expect = require('expect.js');

var Test = function(parent, name, getParameters, validate) {
	this._parent = parent;
	this._type = 'Test';
	this._name = name;
	this._getParameters = getParameters;
	this._validate = validate;
};
module.exports = Test;


Test.prototype.run = function() {
	var thisTest = this;
	var parameters = (typeof this._getParameters === 'function') 
		? this._getParameters(this._parent, this)
		: this._getParameters
	;
	return Promise(
		function(resolve, reject, notify) {
			this._parent.executor(
				parameters.document, 
				parameters.options
			)
			.then(
				function(results) {
					var testErrors = null;
					var args = [];
					for (var n in arguments) {
						args.push(arguments[n]);
					}
					try {
						thisTest._validate(null, results);
					} catch(err) {
						testErrors = err;
					}
					args.unshift(thisTest._name);
					args.unshift(testErrors);
					if (testErrors === null) {
						return resolve(results);
					}
					return reject(testErrors);
				},
				function(errors) {
					var testErrors = null;
					var args = [];
					for (var n in arguments) {
						args.push(arguments[n]);
					}
					try {
						thisTest._validate(errors, null);
					} catch(err) {
						testErrors = err;
					}
					args.unshift(thisTest._name);
					args.unshift(testErrors);
					if (testErrors === null) {
						return resolve(errors);
					}
					return reject(testErrors);
				}
			);
		}
	);
};

