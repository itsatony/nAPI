var defaultAllows = {};
defaultAllows.userIsLoggedIn = function() { // thisApiCall scope
	return (this.get('user').isVirtual === false);
};

module.exports = {
	name: 'allows',
	allows: defaultAllows
};
