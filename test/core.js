var util = require('util');
var nAPI = require('../lib/napi.js');

var Lg = require('lg'); 
var log = new Lg({log2console:true, logLevel:1000});

console.deb = function(obj) {
	var debug = util.inspect(obj, { showHidden: true, depth: null, colors: true });
	console.log(debug);
};


var adapterConfig_mongoDB_users = {
	type: 'mongodb',
	host: '127.0.0.1',
	port: 29097,
	user: null,
	pass: null,
	db: 'napi',
	collection: 'users'
};


var myAllow = nAPI.Utils.allows.createWhitelistAllow([nAPI.Defaults.allows.userIsLoggedIn]);

var api = new nAPI.ApiCore('testapi');
api._addResource('users', [ adapterConfig_mongoDB_users ]);
api.users.get._addSpecifier(
	'byId',
	[
		[ 'allow', myAllow ],
		[ 'action', nAPI.Defaults.mongoDB.actions.get.byId ]
	]
);		


// how to run a specifier query (only, not other layers) internally
var demoReq = {
	resource: 'users',
	method: 'get',
	specifier: 'byId',
	resourceVersion: '1.0.0',
	document: {
		_id: -1
	}
};
var demoRes = {
};
// api.run(demoReq,	demoRes,	function() {console.log('done');} );

var a = log.njson(api, 'napi_init');



// console.deb(nAPI.Defaults);
console.log('-----------------------------------');
// console.log(api.users.get);
// console.deb(api.users.get.byId);

api.users.get.byId({ _id:'123' }, { limit:1 }, function(err, results) { console.log('got answer:', err, results); });

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

