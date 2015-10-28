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
		console.log(err);
	});

	thisDBWrapper.db.on('connect', function (err) {
	});

	thisDBWrapper.db.on('ready', function (err) {
		if (err === null) {
			// console.log("Connected correctly to server");
		}
		if (typeof callback === 'function') {
			callback(null, null, thisDBWrapper.db);
		}
	});
};


var actions = {
	get: {
		get: redis_get,
		scard: redis_scard
	}, 
	put: {
	},
	post: {
		sadd: redis_sadd,
		lpush: redis_lpush,
		set: redis_set,
		setwithttl: redis_setwithttl
	},
	delete: {
		srem: redis_srem
	}
};


var callbacks = {
	get: redis_get_callback
};


function redis_get(layer, specifier, next) {
	// console.log('--::: redis_get ::--', arguments);
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var cb = callbacks.get.apply(this,  [next]);
	// console.log('---document---', document);
	return db.get(document.key, cb);
};


function redis_scard(layer, specifier, next) {
	// console.log('--::: redis_scard ::--');
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var cb = callbacks.get.apply(this,  [next]);
	// console.log('---document---', document);
	return db.scard(document.setName, cb);
};


function redis_sadd(layer, specifier, next) {
	// console.log('--::: redis_sadd ::--', arguments);
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var cb = callbacks.get.apply(this,  [next]);
	console.log('---document---', document);
	return db.sadd(document.setName, document.member, cb);
};


function redis_set(layer, specifier, next) {
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	console.log('--::: redis_set ::--', document);
	var cb = callbacks.get.apply(this,  [next]);
	console.log('---document---', document);
	return db.set(document.key, document.value, cb);
};


function redis_setwithttl(layer, specifier, next) {
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	// console.log('--::: $$$$$$$$$$$ redis_setwithttl ::--', document);
	var cb = callbacks.get.apply(this,  [next]);
	// console.log('---document---', document);
	if (typeof document.ttl !== 'number') {
		document.ttl = 1000;
	}
	return db.multi(
		[
			[ 'set', document.key, document.value ],
			[ 'pexpire', document.key, document.ttl ]
		]
	).exec(
		cb
	);		
};


function redis_lpush(layer, specifier, next) {
	console.log('--::: redis_lpush ::--');
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var cb = callbacks.get.apply(this,  [next]);
	console.log('---document---', document);
	return db.lpush(document.setName, document.member, cb);
};


function redis_srem(layer, specifier, next) {
	// console.log('--::: redis_srem ::--', arguments);
	var db = specifier.apiCall.get('adaptors').redis;
	var document = specifier.apiCall.get('document') || {};
	var cb = redis_get_callback.apply(this,  [next]);
	// console.log('---document---', document);
	return db.srem(document.setName, document.member, cb);
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