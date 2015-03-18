var util = require('util');
var Q = require('q');
var nAPI = require('../lib/napi.js');

var Lg = require('lg'); 
var log = new Lg({log2console:true, logLevel:1000});

console.deb = function(obj) {
	var debug = util.inspect(obj, { showHidden: true, depth: null, colors: true });
	console.log(debug);
};


var adapterConfig_mongoDB_users = {
	name: 'mongoDB', 
	type: 'mongoDB',
	host: '127.0.0.1',
	port: 27017,
	user: null,
	pass: null,
	db: 'napi',
	collection: 'users'
};



var api = new nAPI.ApiCore('testapi');
api._addResource('users', [ adapterConfig_mongoDB_users ], ready);


function ready() {
	console.log('----------------READY-------------------');
	var myAllow = nAPI.Utils.allows.createWhitelistAllow([nAPI.Defaults.allows.userIsLoggedIn]);
	api.users.get._addSpecifier(
		'byId',
		[
			[ 'allow', myAllow ],
			[ 'action', nAPI.Adaptors.mongoDB.actions.get.byId ]
		]
	);
	api.users.get.byId({ _id:'123' }, { limit:1 }, function(err, results) { console.log('--->>>got answer:', err, results); });
	var a = log.njson(api, 'napi_init');
};
