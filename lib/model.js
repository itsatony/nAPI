var Model = function() {
	this.definition = {};
};
Model.prototype.determineUserState = function() {
	return 'default';
};
Model.prototype.render = function() {
	return this.definition;
};
Model.prototype.defineProperty = function(name, specs) {
	var fullSpecs = {
		__name: name,
		__description: '',
		__optional: true,
		__example: null,
		__default: function() { return null; },
		__validate: function() { return null; },
		__filter: function(value) { 
			return {
				default: value,
				owner: value,
				editor: value,
				group: value,
				user: value,
				guest: value
			};
		}
	};
	if (typeof specs === 'object') {
		for (var s in specs) {
			fullSpecs[s] = specs[s];
		}
	}
	var baseObj = createPropertiesFromDotString(this.definition, name, fullSpecs);
	return this;
};


function createPropertiesFromDotString(obj, dotString, fullSpecs) {
	var sequence = dotString.split('.');
	var usedCascade = sequence[0];
	subObj = obj;
	for (var i=0; i<sequence.length; i+=1) {
		if (typeof subObj[sequence[i]] !== 'object' || subObj[sequence[i]] === null) {
			subObj[sequence[i]] = {};			
		}
		subObj = subObj[sequence[i]];
		usedCascade += '.' + sequence[i];
	}
	for (var n in fullSpecs) {
		subObj[n] = fullSpecs[n];
	}
	return subObj;
};


module.exports = Model;