var Q = require('q');
var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var nAPI = require('../lib/napi.js');
var Model = nAPI.Model;
var testModel = null;
var testModel2 = null;
var testUser = null;
var exportedModel = '';

describe(
	'Model', 
	function() {
		it(
			'creates a napi Model', 
			function() {
				testModel = Model('user');
				testModel.__defineProperty(
					'name',
					{
						description: 'a name for the user.',
						type: 'string',
						optional: true,
						example: 'ulrich',
						default: function() {
							return 'noname';
						},
						validate: function(value) {
							try {
								expect(value).to.be.a('string');
								expect(value.length).to.be.above(1);
								expect(value.length).to.be.below(65);
							} catch(err) {
								var error = new Error('name: Bad Value. Needs to be a string between 2 and 64 characters.');
								return error;
							}
							return null;
						},
						filter: function(value) {
							return {
								default: value,
								owner: value,
								editor: value,
								group: value,
								user: value,
								guest: value
							};
						}
					}
				);
			}
		);		
		it(
			'creates a testModel instance', 
			function() {
				testUser = testModel.__create();
			}
		);
		it(
			'tests if testUser.name is valid', 
			function() {
				testModel.name.validate(testUser.name);
			}
		);
		it(
			'export the Model', 
			function() {
				exportedModel = testModel.__toJSON();
			}
		);
		it(
			'import the exported Model', 
			function() {
				testModel2 = Model().__fromJSON(exportedModel);
			}
		);
		it(
			'validate name via imported Model', 
			function() {
				testModel2.name.validate(testUser.name);
			}
		);
	}
);