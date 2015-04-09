var Model = function() {
	this.definition = {};
};
Model.prototype.determineUserState = function() {
	return 'default';
};
Model.prototype.generateParameterValidation = function(mode, list) {
	var model = this.definition;
	// list is   fieldName, optional, default
	var parameters = {};
	var tmp = [];
	var propName = '';
	var modelPropName = '';
	if (mode === '+' || mode === 'accept') {
		for (var n=0;n<list.length;n+=1) {
			modelPropName = list[n].split(' as ')[0];
			// console.log('modelPropName==' + modelPropName);
			tmp = resolveDotString(model, modelPropName)
			if (tmp instanceof Error) {
				console.log(tmp);
				return tmp;
			}
			// console.log('tmp[0]==' + tmp[0]);
			propName = tmp[0].split('.').pop();
			if (list[n].indexOf(' as ') > -1) {
				propName = list[n].split(' as ')[1];
			}
			// console.log('propName==' + propName);
			parameters[propName] = tmp[1];
			if (parameters[list[n]] instanceof Error) {
				return parameters[list[n]];
			}
		}
	} else if (mode === '-' || mode === 'deny')  {
		for (var n in model) {
			if (list.indexOf(n) === -1) {
				parameters[n] = model[n];
			}
		}
	}
	return parameters;
};
function resolveDotString(obj, dotString) {
	var sequence = dotString.split('.');
	var usedCascade = '';
	subObj = obj;
	for (var i=0; i<sequence.length; i+=1) {
		if (typeof subObj[sequence[i]] !== 'undefined') {
			subObj = subObj[sequence[i]];
			usedCascade += '.' + sequence[i];
		} else {
			return new Error('obj.' + usedCascade + ' is not defined');
		}
	}
	return [ usedCascade, subObj ];
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


Model.prototype.instance = function(instance) {
	var thisModel = this;
	return {
		get: function(property) {
			if (typeof instance[property] !== 'undefined') {
				return instance[property];
			}
			if (typeof thisModel.definition[property] === 'undefined') {
				return new Error('unknown property: ' + property);
			}
			return thisModel.definition[property].default();
		},
		set: function(property, value) {
			var hasError = this.validate(property, value);
			if (hasError !== null) {
				return hasError;
			}
			instance[property] = value;
			return instance[property];
		},
		validate: function(property, value) {
			return thisModel.definition[property].__validate(value);
		},
		filter: function(userState, data, model) {
			var filteredProperty = null;
			var stateFilters = null;
			var valueFilter = null;
			var filteredResult = {};
			data = data || instance;
			model = model || thisModel.definition;
			if (data === null) {
				return null;
			}
			for (var p in data) {
				if (typeof model[p] === 'undefined') {
					continue;
				}
				stateFilters = model[p].__filter(data[p]);
				if (stateFilters === null) {
					filteredResult[p] = this.filter(userState, data[p], model[p]);
					continue;
				}
				valueFilter = (typeof stateFilters[userState] !== 'undefined') 
					?	stateFilters[userState]
					: stateFilters['default']
				;
				filteredProperty = (typeof valueFilter === 'function') 
					? valueFilter(data[p]) 
					: valueFilter
				;
				filteredResult[p] = filteredProperty;
			}
			return filteredResult;
		}
	}
};


// Model.prototype.filter = function(userState, data, model) {
	// var filteredProperty = null;
	// var stateFilters = null;
	// var valueFilter = null;
	// var filteredResult = {};
	// data = data || this.instance;
	// model = model || this.model;
	// if (data === null) {
		// return null;
	// }
	// for (var p in data) {
		// if (typeof model[p] === 'undefined') {
			// console.log('--> SKIPPED ' + p);
			// continue;
		// }
		// console.log('--> filtering ' + p);
		// stateFilters = model[p].__filter(data[p]);
		// if (stateFilters === null) {
			// filteredResult[p] = this.filter(userState, data[p], model[p]);
			// continue;
		// }
		// valueFilter = (typeof stateFilters[userState] !== 'undefined') 
			// ?	stateFilters[userState]
			// : stateFilters['default']
		// ;
		// filteredProperty = (typeof valueFilter === 'function') 
			// ? valueFilter(data[p]) 
			// : valueFilter
		// ;
		// if (p === 'oAuthTokens' || p === 'oAuthToken' || p === 'twitchtv')  {
			// console.log('::FILTER::', p, data[p], filteredProperty)
		// }
		// filteredResult[p] = filteredProperty;
	// }
	// return filteredResult;
// };

	
	
	

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