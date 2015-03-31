var redis = require('redis');


var DBWrapper = function(name, config, actions, callbacks) {
	this.name = name;
	this.db = null;
	this._actions = actions;
	this._config = config;
	this._callbacks = callbacks;
};


DBWrapper.prototype.init = function(callback) {	
	var thisDBWrapper = this;
	thisDBWrapper.db = redis.createClient(
		this._config.port,
		this._config.host,
		this._config.options
	);
	thisDBWrapper.db.on('error', function (err) {
		// log.add('REDIS ERROR!', 'red', 'napi.adaptors.redis');
		// log.add(err, 'red', 'napi.adaptors.redis');
		console.log(err);
	});

	thisDBWrapper.db.on('connect', function (err) {
		// log.add('connected to redis.', 'green', 'napi.adaptors.redis');
	});

	thisDBWrapper.db.on('ready', function (err) {
		// log.add('Redis is ready to receive commands.', 'green', 'napi.adaptors.redis');
		if (err === null) {
			// console.log("Connected correctly to server");
		}
		if (typeof callback === 'function') {
			callback(err, thisDBWrapper.db);
		}
	});
};


var actions = {
	get: {
		get: redis_get
	}, 
	put: {},
	post: {},
	delete: {}
};


var callbacks = {
	get: redis_get_callback
};


function redis_get(layer, specifier, next) {
	// console.log('--::: mongoDB_get_byId ::--', arguments);
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var moreOptions = specifier.apiCall.get('options') || {};
	var query = document.id;
	var options = {
		limit: (moreOptions.limit || 1)
	};
	var fields = [];
	var cb = redis_get_callback.apply(this,  [next]);
	// console.log('---QUERY---', query);
	// console.log('---options---', options);
	// console.log('---collection---', collection);	
	return db.get(query, cb);
};


function redis_sadd(layer, specifier, next) {
	// console.log('--::: mongoDB_get_byId ::--', arguments);
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var moreOptions = specifier.apiCall.get('options') || {};
	// TODO  parameter CHECKS!
	var options = {
		limit: (moreOptions.limit || 1)
	};
	var fields = [];
	var cb = redis_get_callback.apply(this,  [next]);
	// console.log('---QUERY---', query);
	// console.log('---options---', options);
	// console.log('---collection---', collection);	
	var result = db.sadd(document.setName, document.member);
	return next(null, result);
};


function redis_srem(layer, specifier, next) {
	// console.log('--::: mongoDB_get_byId ::--', arguments);
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var moreOptions = specifier.apiCall.get('options') || {};
	// TODO  parameter CHECKS!
	var options = {
		limit: (moreOptions.limit || 1)
	};
	var fields = [];
	var cb = redis_get_callback.apply(this,  [next]);
	// console.log('---QUERY---', query);
	// console.log('---options---', options);
	// console.log('---collection---', collection);	
	var result = db.srem(document.setName, document.member);
	return next(null, result);
};


function redis_get_callback(callback) {
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



module.exports = {
	name: 'redis',
	init: function(config, cb) {
		return new DBWrapper(
			'redis',
			config
		).init(cb);
	},
	actions: actions,
	callbacks: callbacks
};