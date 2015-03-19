var defaultAllows = {};
defaultAllows.userIsLoggedIn = function() { // thisApiCall scope
console.log('*********allowExecutor', this);
	return (this.get('user').isVirtual === false);
};

module.exports = {
	name: 'allows',
	allows: defaultAllows
};
