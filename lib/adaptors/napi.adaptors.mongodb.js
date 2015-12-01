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
	findAndModify: mongoDB_findAndModify_callback,
};


function mongoDB_get_byId(layer, specifier, next) {
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
	var cb = mongoDB_find_callback.apply(this,  [next]);
	return collection.find(query, fields, options).toArray(cb);
};

function mongoDB_post_one(layer, specifier, next) {
	var collection = specifier.apiCall.get('adaptors').mongoDB;
	var document = specifier.apiCall.get('document') || {};
	var moreOptions = specifier.apiCall.get('options') || {};
	var options = {};
	var cb = mongoDB_insert_callback.apply(this,  [next]);
	delete document._id;
	return collection.insert(document, options, cb);
};


function mongoDB_delete_byId(layer, specifier, next) {
	var collection = specifier.apiCall.get('adaptors').mongoDB;
	var document = specifier.apiCall.get('document') || {};
	var moreOptions = specifier.apiCall.get('options') || {};
	var options = {};
	var cb = mongoDB_delete_callback.apply(this,  [next]);
	var query = {
		_id: makeMongoId(document._id)
	};
	var sort = [['b', 1]];
	return collection.findAndRemove(query, sort, options, cb);
};


function mongoDB_find_callback(callback) {
	var thisApiCall = this;
	return function(err, res) {
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
		if (typeof callback === 'function') {
			return callback.apply(thisApiCall, [ err, res ]);
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
			console.log('///////////////////// sending res.value: ', res.value);
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