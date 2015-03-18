var config = {
	base: {
		type: 'mongodb',
		host: '127.0.0.1',
		port: 29097,
		user: null,
		pass: null,
		db: 'napi'
	}
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

module.exports = {
	name: 'mongoDB',
	actions: actions,
	config: config,
	callbacks: callbacks
};


function mongoDB_get_byId(resource, document, moreOptions, callback) {
	document = document || {};
	moreOptions = moreOptions || {};
	var query = {
		_id: document._id
	};
	var options = {
		limit: (moreOptions.limit || 1)
	};
	var fields = [];
	var cb = mongoDB_get_callback(callback);
	return resource._adaptors.mongodb.get(query, fields, options).toArray(cb);
};


function mongoDB_get_callback(callback) {
	return function() {
		if (typeof callback === 'function') {
			return callback.apply(this, arguments);
		}
		return false;
	}
};

