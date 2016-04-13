var redis = require('redis');
var q = require('q');
var Promise = q.Promise;

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
	thisDBWrapper.initialConnectDone = false;
	return Promise(
		function(resolve, reject, notify) {
			thisDBWrapper.db.on(
				'error',
				function (err) {
					if (thisDBWrapper.initialConnectDone === false) {
						return reject(err);
					}
				}
			);
			thisDBWrapper.db.on(
				'connect',
				function (err) {
				}
			);
			thisDBWrapper.db.on(
				'ready',
				function () {
					thisDBWrapper.initialConnectDone = true;
					return resolve(thisDBWrapper.db);
				}
			);
		}
	);
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


var callbackWrapper = function(mode, scope, name, apiCall, resolve, reject) {
	return callbacks[mode].apply(
		scope,
		[
			function(err, result) {
				log.debug('[[[[[[[[[[[[[[[[[[[[[[[[[[[[ users.mongoDB.callbackWrapper:' + apiCall._specifier.get('callPath'), err, (result !== null && Array.isArray(result)));
				if (err) {
					console.log('adaptors.mongodb.' + name + ' ERROR', err);
					apiCall.set('errors', err);
					return reject(err);
				}
				apiCall.set('results', result);
				resolve(result);
				return result;
			}
		]
	);
};
function promisifiedRedisCallWrapper(apiCall, mode, scope, name, dbCall) {
	return function() {
		return Promise(
			function(resolve, reject, notify) {
				var cb = callbackWrapper(mode, scope, name, apiCall, resolve, reject);
				return dbCall(cb);
			}
		).catch(
			app.errorHandler
		)
	};
};


function redis_get(apiCall) {
	var db = apiCall.get('adaptors').redis;
	var document = apiCall.get('document') || {};
	var self = this;
	return promisifiedRedisCallWrapper(
		apiCall, 'get', self, 'redis_get',
		function(callback) {
			return db.get(document.key, callback);
		}
	);
};


function redis_scard(apiCall) {
	var db = apiCall.get('adaptors').redis;
	var document = apiCall.get('document') || {};
	var self = this;
	return promisifiedRedisCallWrapper(
		apiCall, 'get', self, 'redis_get',
		function(callback) {
			return db.scard(document.setName, callback);
		}
	);
};


function redis_sadd(apiCall) {
	var db = apiCall.get('adaptors').redis;
	var document = apiCall.get('document') || {};
	var self = this;
	return promisifiedRedisCallWrapper(
		apiCall, 'get', self, 'redis_get',
		function(callback) {
			return db.sadd(document.setName, document.member, callback);
		}
	);
};


function redis_set(apiCall) {
	var db = apiCall.get('adaptors').redis;
	var document = apiCall.get('document') || {};
	var self = this;
	return promisifiedRedisCallWrapper(
		apiCall, 'get', self, 'redis_get',
		function(callback) {
			return db.set(document.key, document.value, callback);
		}
	);
};


function redis_setwithttl(apiCall) {
	var db = apiCall.get('adaptors').redis;
	var document = apiCall.get('document') || {};
	if (typeof document.ttl !== 'number') {
		document.ttl = 1000;
	}
	var self = this;
		log.debug('===========redis_setwithttl===========');
	return promisifiedRedisCallWrapper(
		apiCall, 'get', self, 'redis_get',
		function(callback) {
			return db.multi(
				[
					[ 'set', document.key, document.value ],
					[ 'pexpire', document.key, document.ttl ]
				]
			).exec(
				function(err, res) {
					log.debug('===========redis_multi_answer===========', arguments);
					callback.apply(self, [ err, res ]);
				}
			);
		}
	);
};


function redis_lpush(apiCall) {
	console.log('--::: redis_lpush ::--');
	var db = apiCall.get('adaptors').redis;
	var document = apiCall.get('document') || {};
	var self = this;
	return promisifiedRedisCallWrapper(
		apiCall, 'get', self, 'redis_get',
		function(callback) {
			return db.lpush(document.setName, document.member, callback);
		}
	);
};


function redis_srem(apiCall) {
	var db = apiCall.get('adaptors').redis;
	var document = apiCall.get('document') || {};
	var self = this;
	return promisifiedRedisCallWrapper(
		apiCall, 'get', self, 'redis_get',
		function(callback) {
			return db.srem(document.setName, document.member, callback);
		}
	);
};


function redis_get_callback(callback) {
	var thisApiCall = this;
	return function(err, res) {
		if (typeof callback === 'function') {
			return callback.apply(thisApiCall, [ err, res ]);
		}
		return false;
	}
};



module.exports = {
	name: 'redis',
	init: function(config, cb) {
		var a = new DBWrapper(
			'redis',
			config
		);
		return a.init(cb);
	},
	actions: actions,
	callbacks: callbacks
};
