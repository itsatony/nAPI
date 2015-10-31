var util = require('util');
var Q = require('q');
var expect = require('expect');
var nAPI = require('../lib/napi.js');


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



api = null;

nAPI.ApiCore('testapi', null)
	.then(
		function(myApi) {
			api = myApi;
			return api._addResource('users', [ adapterConfig_mongoDB_users ]);
		}
	).then(
		ready
	).catch(
		function(err) {
			console.error('####### ERROR ##### ', err.stack || err);
			process.exit(1);
		}
	)
;



function ready() {
	console.log('----------------READY-------------------');
	var myAllow = nAPI.Utils.allows.createBlacklistAllow([]);
	// name, steps, description, parameters, tests
	api.users.get._addSpecifier(
		'byId',
		[
			{ 
				name: 'allow', 
				resolveHandler: myAllow
			},
			{ 
				name: 'action', 
				resolveHandler: nAPI.Adaptors.mongoDB.actions.get.byId 
			},
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
	// console.log('+++++++++++++++++++\n');
	// console.log(api.users.get.byId);
	api.users.get.byId(
		{ _id: '4f39e4f12ce81f09340002b9' }, 
		{ limit:1 }
	).then(
		function(result) {
			console.log(':::::: API ANSWERED :::::\n', result);
		}
	).catch(
		function(err) {
			console.error('::::::: ERROR::::\n', err.stack || err);
		}
	).finally(
		function() {
			process.exit();
		}
	);
	// console.log(JSON.stringify(api.getDocumentation(), null, '  '));
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


