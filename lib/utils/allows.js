var q = require('q');
var Promise = q.Promise;

function createBlacklistAllow(rules) {
	return function() {
		return Promise(
			function(resolve, reject) {
				var allow = false;
				if (rules.length === 0) {
					return resolve(true);
				}
				for (var i=0; i<rules.length; i+=1) {
					allow = rules[i].apply(this);
					if (allow === false) {
						return resolve(true);
					}
				}
				return reject(new Error('not allowed!'));
			}
		);
	}
};

function createWhitelistAllow(rules) {
	return function() {
		return Promise(
			function(resolve, reject) {
				var allow = false;
				for (var i=0; i<rules.length; i+=1) {
					allow = rules[i].apply(this);
					if (allow === true) {
						return resolve(true);
					}
				}
				return reject(new Error('not allowed!'));
			}
		);
	}
};


module.exports = {
	name: 'allows',
	createWhitelistAllow: createWhitelistAllow,
	createBlacklistAllow: createBlacklistAllow
};