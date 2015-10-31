var Specifier = require(__dirname + '/specifier');
var MetaEvents = require(__dirname + '/metaEvents.js');

function MethodWrapper(name, resource) {
	try {
		var newMethod = new Method(name, resource);
		return newMethod;
	} catch(err) {
		return err;
	}
};
module.exports = MethodWrapper;


var Method = function(name, resource) {
	this._resource = resource;
	this._api = resource._api;
	this._name = name.toLowerCase();
	this.events = MetaEvents('{napi.method}.' + this._resource._name + '.' + name);
	this.events.forwardTo(this._resource.events);
	this._type = 'Method';
	this._specifiers = {};
};


Method.prototype._addSpecifier = function(name, steps, description, parameters, tests) {
	var lowerName = name.toLowerCase();
	// console.log(parameters);
	parameters = parameters || {};
	description = description || '';
	tests = tests || [];
	var stringifiedTests = [];
	var stringedTest = '';
	for (var n=0; n<tests.length; n+=1) {
		stringedTest = {
			name: tests[n].name,
			index: (typeof tests[n].index === 'number') ? tests[n].index : 9999,
			parameters: tests[n].parameters.toString(),
			validate: tests[n].validate.toString()
		};
		stringifiedTests.push(stringedTest);
	}
	this._api._documentation[this._resource._name][this._name][name] = {
		description: description,
		parameters: {},
		tests: stringifiedTests
	};
	for (var i in parameters) {
		this._api._documentation[this._resource._name][this._name][name].parameters[i] = {
			description: parameters[i].__description || 'not described',
			optional: parameters[i].__optional || false,
			type: parameters[i].__type || 'string',
			example: parameters[i].__example || 'example'			
		};
	}
	this._specifiers[name] = Specifier(name, this, steps, parameters, tests);
	// force applying the api scope and create a new specifier instance for each call
	this[name] = function() {
		var args = [];
		for (var n in arguments) {
			args.push(arguments[n]);
		}
		return this._specifiers[name].executor.apply(this._specifiers[name], args);
	}
	this[lowerName] = this[name];
	// this[name].runTest = this._wrapSpecifierInstanceTest(name);
	this.events.metaEmit('addSpecifier', this._specifiers[name], this);
	return this;
};



