
function createBlacklistAllow(rules) {
	// TODO:  should make this asyncable ?
	return function(next) {
		var allow = true;
		for (var i=0; i<rules.length; i+=1) {
			allow = rules[i].apply(this);
			if (allow === false) {
				next(false);
			}
		}
		next(true);
	};
};

function createWhitelistAllow(rules) {
	// TODO:  should make this asyncable ?
	return function(next) {
		var allow = true;
		for (var i=0; i<rules.length; i+=1) {
			allow = rules[i].apply(this);
			if (allow === true) {
				next(true);
			}
		}
		next(false);
	};
};


module.exports = {
	name: 'allows',
	createWhitelistAllow: createWhitelistAllow,
	createBlacklistAllow: createBlacklistAllow
};