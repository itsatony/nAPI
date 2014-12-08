var nAPI = require('../lib/napi.js');


console.deb = function(obj) {
	var debug = util.inspect(api, { showHidden: true, depth: null, colors: true });
	console.log(debug);
};

var defaultSpecifiers = {};
defaultSpecifiers.mongodb = {};
defaultSpecifiers.mongodb.byId = mongodb_specifiers_get_byId;
defaultSpecifiers.memory = {};
defaultSpecifiers.memory.byId = memory_specifiers_get_byId;

var defaultCallbacks = {};
defaultCallbacks.mongodb = {};
defaultCallbacks.mongodb.get = mongodb_callbacks_get;
defaultCallbacks.memory = {};
defaultCallbacks.memory.get = memory_callbacks_get;

var defaultAllows = {};
defaultAllows.userIsLoggedIn = function(thisApiCall) {
	console.log(this);
	return (thisApiCall.get('user').isVirtual === false);
};

function createAllow(rules) {
	// TODO:  should make this asyncable ?
	return function(user) {
		var allow = true;
		for (var i=0; i<rules.length; i+=1) {
			allow = rules[i](user);
			if (allow === false) {
				return false;
			}
		}
		return true;
	};
};

function mongodb_specifiers_get_byId(resource, document, moreOptions, callback) {
	var query = {
		_id: document._id
	};
	var options = {
		limit: (moreOptions.limit || 1)
	};
	var fields = [];
	resource.adaptors.mongodb.get(query, fields, options).toArray(defaultCallbacks.mongodb.get);
};

function mongodb_callbacks_get() {
	// execute from the driver-derived perspective
	callback.apply(this, arguments);
};


function memory_specifiers_get_byId(resource, document, moreOptions, callback) {
	var query = {
		_id: document._id
	};
	var options = {
		limit: (moreOptions.limit || 1)
	};
	var fields = [];
	return resource.adaptors.memory.get(query,defaultCallbacks.memory.get);
};

function memory_callbacks_get() {
	// execute from the driver-derived perspective
	callback.apply(this, arguments);
};

var adaptorConfig_mongoDB_base = {
	type: 'mongodb',
	host: '127.0.0.1',
	port: 29097,
	user: null,
	pass: null,
	db: 'napi'
};
// todo: use extend here
var adapterConfig_mongoDB_users = {
	type: 'mongodb',
	host: '127.0.0.1',
	port: 29097,
	user: null,
	pass: null,
	db: 'napi',
	collection: 'users'
};

var adapterConfig_memory_users = {
	type: 'memory',
	collection: 'users'
};




var api = new nAPI.ApiCore('testapi');
api._addResource('users', [ adapterConfig_memory_users ]);
api.users.get._addSpecifier(
	'byId',
	{
		// allow: createAllow([defaultAllows.userIsLoggedIn]),
		allow: [ defaultAllows.userIsLoggedIn ],
		action: defaultSpecifiers.mongodb.byId
	}
);

// console.deb(api);
// console.log('-----------------------------------');
// console.log(api.users.get);
// console.log(api.users.get.byId);

// how to run a specifier query (only, not other layers) internally
var demoReq = {
	resource: 'users',
	method: 'get',
	specifier: 'byId',
	resourceVersion: '1',
	document: {
		_id: -1
	}
};
var demoRes = {
};
// api.run(demoReq,	demoRes,	function() {console.log('done');} );

console.log(api);

// api.users.get.byId();

// api.users.get.byId.action({ _id:'123' }, { limit:1 }, function(err, results) {  });

// same externally:
/*
jQuery.ajax(
	{
		url: '/users/get/byId',
		data: {
			document: {
				_id: '123'
			},
			options: {
				limit: 1
			}
		}
	}
);
*/

// redo and make sure 
// - all api calls (internal and external) are executed in the apiCall scope
// -- maybe specifiers and their steps/layers are wrappers setting the api scope ?
// - apiCall should have a definable user, defaulting to a virtual admin?
// - include a propagation step

// --> try redo with api not being an instantiatable object, but a 'simple' middleware function that creates a apiCall object instance,
// hence, apiCall will get resources ... and become the wrapping scope for everything in that one call 


// mu.users.get.byId.action
// 
// realm.resource.method.specifier.layer
