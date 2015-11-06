var Module = {
	name: 'empty',
	init: function(config, cb) {
		return new Adaptor(
			'empty',
			config
		).init(cb);
	},
	actions: actions,
	callbacks: callbacks
};

var actions = {
	get: {
		get: empty_anything_action
	}, 
	put: {
	},
	post: {
	},
	delete: {
	}
};

var callbacks = {
	get: empty_anything_callback
};

function empty_anything_action(layer, specifier, next) {
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var cb = callbacks.get.apply(this,  [next]);
	// console.log('---document---', document);
	return cb(null, null);
};


function empty_anything_callback(callback) {
	var thisApiCall = this;
	return function(err, res) {
		// console.log('---redis_get_callback---');
		// console.log(thisApiCall, err, res);
		if (typeof callback === 'function') {
			return callback.apply(thisApiCall, [ err, res ]);
		}
		return false;
	}
};


var Adaptor = function(name, config, actions, callbacks) {
	this.name = name;
	this.db = null;
	this._actions = actions;
	this._config = config;
	this._callbacks = callbacks;
};


Adaptor.prototype.init = function(callback) {	
	var thisAdaptor = this;
	if (typeof callback === 'function') {
		callback(null, null, thisAdaptor.db);
	}
};


module.exports = Module;