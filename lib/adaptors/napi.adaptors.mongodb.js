var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;


var DBWrapper = function(name, config, actions, callbacks) {
	this.name = name;
	this.db = null;
	this._actions = actions;
	this._config = config;
	this._callbacks = callbacks;
};


DBWrapper.prototype.init = function(callback) {	
	var thisDBWrapper = this;
	var url = 'mongodb://' + this._config.host + ':' + this._config.port + '/' + this._config.db;
	// Use connect method to connect to the Server
	return MongoClient.connect(
		url, 
		function(err, db) {
			thisDBWrapper.db = db;
			thisDBWrapper.collection = null;
			if (err === null) {
				// console.log("Connected correctly to server");
				thisDBWrapper.collection = db.collection(thisDBWrapper._config.collection);
			}
			if (typeof callback === 'function') {
				callback(err, thisDBWrapper.db, thisDBWrapper.collection);
			}
		}
	);
};


var actions = {
	get: {
		byId: mongoDB_get_byId
	}, 
	put: {},
	post: {},
	delete: {}
};

var callbacks = {
	get: mongoDB_get_callback
};


function mongoDB_get_byId(layer, specifier, next) {
	// console.log('--::: mongoDB_get_byId ::--', arguments);
	var collection = specifier.apiCall.get('adaptors').mongoDB;
	var document = specifier.apiCall.get('document') || {};
	var moreOptions = specifier.apiCall.get('options') || {};
	var query = {
		_id: makeMongoId(document._id)
	};
	var options = {
		limit: (moreOptions.limit || 1)
	};
	var fields = [];
	var cb = mongoDB_get_callback.apply(this,  [next]);
	// console.log('---QUERY---', query);
	// console.log('---options---', options);
	// console.log('---collection---', collection);	
	return collection.find(query, fields, options).toArray(cb);
};


function mongoDB_get_callback(callback) {
	var thisApiCall = this;
	// console.log('---init mongoDB_get_callback---');
	return function(err, res) {
		// console.log('--->run mongoDB_get_callback---');
		// console.log(thisApiCall, err, res);
		// console.log('from mongo (err, resLength): ' + err, res.length);
		// console.log(callback);
		if (typeof callback === 'function') {
			return callback.apply(thisApiCall, [ err, res ]);
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

module.exports = {
	name: 'mongoDB',
	init: function(config, cb) {
		return new DBWrapper(
			'mongoDB',
			config
		).init(cb);
	},
	actions: actions,
	callbacks: callbacks,
	helpers: {
		makeMongoId: makeMongoId
	}
};