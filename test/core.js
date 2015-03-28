var util = require('util');
var Q = require('q');
var expect = require('expect');
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
		],
		'Get a User by their unique ID',
		{
			_id: {
				description: 'a stringified mongoDB type id. user._id is the field name.',
				type: 'string',
				optional: false,
				example: '4f39e4f12ce81f09340002b9',
				default: function() {
					return '-1';
				},
				validate: function(value) {
					try {
						expect(value).to.be.a('string');
						expect(value).to.match(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i);
					} catch(err) {
						return err;
					}
					return value;
				}
			}
		}
	);
	api.users.get.byId({ _id: '4f39e4f12ce81f09340002b9' }, { limit:1 }, function(err, results) { console.log('--->>>got answer:', err, results); });
	var a = log.njson(api, 'napi_init');
	console.log(JSON.stringify(api.getDocumentation(), null, '  '));
};


/*

action layer --[results]--> 
	{A} answer layer with filter specific for requester --[answer]--> requester(===outlet)
	{B} emit results
		{listenToResults} Propagator -> send results to channel of rabbitMQ
			??? how to define the channel??
				[resource]_[uid_of_modified_item]
				users_12345
				chat_channelid

*/


