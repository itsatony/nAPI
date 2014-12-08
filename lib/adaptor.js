var EventEmitter = require('events').EventEmitter;
var util = require('util');


// Adaptor is the unit between the db query and the db. like mongowrapper
var Adaptor = function(name, parent, config, callback) {
	var error = null;
	this.name = name;
	this._type = 'Adaptor';
	this.parent = parent;
	this.config = config;
	if (typeof this[config.type] === 'function') {
		this[config.type](
			this.config, 
			function(err, res) {
				if (typeof callback === 'function') {
					callback(err, res);
				}
			}
		);
	}
	error = new Error('adaptor.001 - adaptor type undefined');
	if (typeof callback === 'function') {
		callback(error, null);
	}
};
util.inherits(Adaptor, EventEmitter);


Adaptor.prototype.memory = function(config, callback) {
	this.collection = {};
	this.name = config.collection;
	if (typeof callback === 'function') {
		callback(null, this);
	}
};


Adaptor.prototype.memory.get = function(query, callback) {
	return callback(null, [ this.collection[query._id] ]);
};


Adaptor.prototype.memory.post = function(query, callback) {
	this.collection[query._id] = query.document;
	return callback(null, [ this.collection[query._id] ]);
};
