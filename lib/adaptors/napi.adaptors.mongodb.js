var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var q = require('q');
var Promise = q.Promise;


var Adaptor = function(name, config, actions, callbacks) {
	this.name = name;
	this.db = null;
	this._actions = actions;
	this._config = config;
	this._callbacks = callbacks;
};


Adaptor.prototype.init = function() {
	var thisAdaptor = this;
	var url = 'mongodb://' + this._config.host + ':' + this._config.port + '/' + this._config.db;
	return Promise(
		function(resolve, reject, notify) {
			thisAdaptor.initialconnect = false;
			MongoClient.connect(
				url,
				function(err, db) {
					thisAdaptor.db = db;
					thisAdaptor.collection = null;
					if (err) {
						return reject(err);
					}
					thisAdaptor.initialconnect = true;
					thisAdaptor.collection = db.collection(thisAdaptor._config.collection);
					return resolve(thisAdaptor.collection);
				}
			);
		}
	);
};


var actions = {
	get: {
		byId: mongoDB_get_byId
	},
	put: {},
	post: {
		one: mongoDB_post_one
	},
	delete: {
		byId: mongoDB_delete_byId
	}
};

var callbacks = {
	get: mongoDB_find_callback,
	put: mongoDB_insert_callback,
	post: mongoDB_insert_callback,
	delete: mongoDB_insert_callback,
	findAndModify: mongoDB_findAndModify_callback
};


function mongoDB_get_byId(apiCall) {
	return function() {
		return Promise(
			function(resolve, reject, notify) {
				var adaptors = apiCall.get('adaptors');
				var collection = adaptors.mongoDB;
				var document = apiCall.get('document') || {};
				var moreOptions = apiCall.get('options') || {};
				var query = {
					_id: makeMongoId(document._id)
				};
				var options = {
					limit: (moreOptions.limit || 1)
				};
				var fields = [];
				var cb = mongoDB_find_callback.apply(
					this,
					[
						function(err, result) {
							if (err) {
								console.log('adaptors.mongodb.mongoDB_get_byId.ERROR', err);
								apiCall.set('errors', err);
								return reject(err);
							}
							apiCall.set('results', result);
							return resolve(result);
						}
					]
				);
				return collection.find(query, fields, options).toArray(cb);
			}
		);
	};
};

function mongoDB_post_one(apiCall) {
	return function() {
		return Promise(
			function(resolve, reject, notify) {
				var collection = apiCall.get('adaptors').mongoDB;
				var document = apiCall.get('document') || {};
				var moreOptions = apiCall.get('options') || {};
				var options = {};
				delete document._id;
				var cb = mongoDB_insert_callback.apply(
					this,
					[
						function(err, result) {
							if (err) {
								console.log('adaptors.mongodb.mongoDB_post_one.ERROR', err);
								apiCall.set('errors', err);
								return reject(err);
							}
							apiCall.set('results', result);
							return resolve(result);
						}
					]
				);
				return collection.insertOne(document, options, cb);
			}
		);
	}
};


function mongoDB_delete_byId(layer, specifier, next) {
	return function() {
		return Promise(
			function(resolve, reject, notify) {
				var collection = apiCall.get('adaptors').mongoDB;
				var document = apiCall.get('document') || {};
				var moreOptions = apiCall.get('options') || {};
				var options = {};
				var cb = mongoDB_delete_callback.apply(
					this,
					[
						function(err, result) {
							if (err) {
								console.log('adaptors.mongodb.mongoDB_delete_byId.ERROR', err);
								apiCall.set('errors', err);
								return reject(err);
							}
							apiCall.set('results', result);
							return resolve(result);
						}
					]
				);
				var query = {
					_id: makeMongoId(document._id)
				};
				var sort = [['b', 1]];
				return collection.findAndRemove(query, sort, options, cb);
			}
		);
	}
};


function mongoDB_find_callback(callback) {
	var thisApiCall = this;
	log.debug('******* mongoDB_find_callback ********** callback', typeof callback);
	return function(err, res) {
		log.debug('******* mongoDB_find_callback HIT ********** callback', typeof callback);
		if (typeof callback === 'function') {
			return callback.apply(thisApiCall, [ err, res ]);
		}
		return false;
	}
};


function mongoDB_delete_callback(callback) {
	var thisApiCall = this;
	return function(err, res) {
		if (typeof callback === 'function') {
			return callback.apply(thisApiCall, [ err, [ res ] ]);
		}
		return false;
	}
};


function mongoDB_insert_callback(callback) {
	var thisApiCall = this;
	return function(err, res) {
		if (err !== null) {
			log.debug('===========mongoDB_insert_callback PROBLEMS!');
			log.error(err);
			log.error(res);
		}
		if (typeof callback === 'function') {
			return callback.apply(thisApiCall, [ err, res.ops ]);
		}
		return false;
	}
};


function mongoDB_findAndModify_callback(callback) {
	var thisApiCall = this;
	return function(err, res) {
		if (err === null && res === null) {
			err = new Error('operation not possible');
		}
		if (typeof callback === 'function') {
			// console.log('///////////////////// sending res.value: ', res.value);
			return callback.apply(thisApiCall, [ err, [res.value] ]);
		}
		return false;
	}
};


function makeMongoId(id) {
  if (typeof id === 'string' && id.length === 24) {
		return mongo.ObjectID(id);
	} else if (typeof id === 'object' && typeof id.toHexString === 'function') {
		return id;
	}
	return false;
};

var Module = {
	name: 'mongoDB',
	init: function(config, cb) {
		var a = new Adaptor(
			'mongoDB',
			config
		);
		return a.init(cb);
	},
	actions: actions,
	callbacks: callbacks,
	helpers: {
		makeMongoId: makeMongoId
	}
};

module.exports = Module;
