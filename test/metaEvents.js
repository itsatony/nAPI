var Q = require('q');
var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


describe(
	'metaEvents', 
	function() {
		var apiLevelHandled = false;
		var resourceLevelHandled = false;
		it(
			'registers a handler on api level, and on resource level', 
			function() {
				var listener1 = api.events.on(
					'metaEventEmitted',
					function() {
						apiLevelHandled = true;
					}
				);
				var listener2 = api.users.events.on(
					'metaEventEmitted',
					function() {
						resourceLevelHandled = true;
					}
				);
				var event = api.users.get._specifiers.byId.events.metaEmit('test1', 'hello world');
			}
		);
		it(
			'both listeners were invoked', 
			function() {
				expect(apiLevelHandled).to.eq(true);
				expect(resourceLevelHandled).to.eq(true);
				return true;
			}
		);
	}
);

