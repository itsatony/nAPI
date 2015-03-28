var defaultAllows = {};
defaultAllows.userIsLoggedIn = function() { // thisApiCall scope
	return (this.get('user').isVirtual === false);
};
defaultAllows.userIsGuest = function() { // thisApiCall scope
	return (this.get('user').isVirtual === true);
};
defaultAllows.alwaysAllow = function() { // thisApiCall scope
	return true;
};

module.exports = {
	name: 'allows',
	allows: defaultAllows
};
