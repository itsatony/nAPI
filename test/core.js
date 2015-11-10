var Q = require('q');
var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


var nAPI = require('../lib/napi.js');

var adapterConfig_mongoDB_users_BAD = {
	name: 'mongoDB', 
	type: 'mongoDB',
	host: '128.0.0.1',
	port: 27017,
	user: null,
	pass: null,
	db: 'napi',
	collection: 'users'
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

describe(
	'apicore.create', 
	function() {
		it(
			'creates a napi instance', 
			function() {
				var thisPromise = nAPI.ApiCore('testapi', null)
					.then(
						function(myApi) {
							api = myApi;
						}
					).then(
						function() {
							expect(api._name).to.eq('testapi');
							expect(api._type).to.eq('NApi');
							expect(api.events).to.be.a('object');
							expect(api.events.metaEmit).to.be.a('function');
							return api;
						}
					).catch(
						function(err) {
							console.error('####### ERROR ##### ', err.stack || err);
							process.exit(1);
						}
					)
				;
				return thisPromise;
			}
		);
	}
);

describe(
	'resource.create', 
	function() {
		it(
			'creates a users resource in the napi instance with a mongodb adaptor', 
			function() {
				// this.timeout(5000);
				var thisPromise = api._addResource('users', [ adapterConfig_mongoDB_users ])
				.then(
					function(myResource) {
						expect(api.users).to.be.a('object');
						expect(myResource._name).to.eq('users');
						expect(myResource._type).to.eq('Resource');
						expect(myResource.events).to.be.a('object');
						expect(myResource.events.metaEmit).to.be.a('function');
						expect(myResource.get).to.be.a('object');
						expect(myResource.get._type).to.eq('Method');
						expect(myResource.get.events).to.be.a('object');
						expect(myResource.get.events.metaEmit).to.be.a('function');
						expect(myResource.post).to.be.a('object');
						expect(myResource.post._type).to.eq('Method');
						expect(myResource.post.events).to.be.a('object');
						expect(myResource.post.events.metaEmit).to.be.a('function');
						expect(myResource.put).to.be.a('object');
						expect(myResource.put._type).to.eq('Method');
						expect(myResource.put.events).to.be.a('object');
						expect(myResource.put.events.metaEmit).to.be.a('function');
						expect(myResource.delete).to.be.a('object');
						expect(myResource.delete._type).to.eq('Method');
						expect(myResource.delete.events.metaEmit).to.be.a('function');
					},
					function(err) {
						throw err;
					}
				).catch(
					function(err) {
						throw err;
					}
				);
				return thisPromise;
			}
		);
	}
);

describe(
	'specifier.create', 
	function() {
		it(
			'creates a specifier for the users resource', 
			function() {
				var myAllow = nAPI.Utils.allows.createBlacklistAllow([]);
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
				expect(api.users.get.byId).to.be.a('function');
				expect(api.users.get._specifiers.byId).to.be.a('object');
				expect(api.users.get._specifiers.byId._name).to.eq('byid');
				expect(api.users.get._specifiers.byId._type).to.eq('Specifier');
			}
		);
	}
);