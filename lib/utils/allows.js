
function createBlacklistAllow(rules) {
	return function(layer, specifier, next) {
		var allow = false;
		for (var i=0; i<rules.length; i+=1) {
			allow = rules[i].apply(this);
			if (allow === false) {
				return next(null, false);
			}
		}
		next(new Error('not allowed!'), false);
	};
};

function createWhitelistAllow(rules) {
	return function(layer, specifier, next) {
		var allow = false;
		for (var i=0; i<rules.length; i+=1) {
			allow = rules[i].apply(this);
			if (allow === true) {
				return next(null, true);
			}
		}
		next(new Error('not allowed!'), false);
	};
};


module.exports = {
	name: 'allows',
	createWhitelistAllow: createWhitelistAllow,
	createBlacklistAllow: createBlacklistAllow
};