var Q = require('q');
var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);



describe(
	'specifier.run', 
	function() {
		it(
			'run the users.getById specifier', 
			function() {
				var thisPromise = api.users.get.byId(
					{ _id: '4f39e4f12ce81f09340002b9' }, 
					{ limit:1 }
				).catch(
					function(err) {
						throw err;
					}
				);
				expect(thisPromise).to.eventually.be.a('array');
				expect(thisPromise).to.eventually.eq([]);
				return thisPromise;
			}
		);
	}
);