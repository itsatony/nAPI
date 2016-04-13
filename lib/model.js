var ModelWrapper = function(name) {
	var newModel = new Model(name);
	return newModel;
};

var Model = function(name) {
	this.__name = name || 'noName';
	this.__definition = {};
};
Model.prototype.__determineUserState = function() {
	return 'default';
};
Model.prototype.__toJSON = function() {
	var jsonModel = {
		__name: this.__name,
		__definition: this.__definition
	}
	try {
		var stringModel = JSON.stringify(jsonModel);
	} catch(err) {
		return err;
	}
	return stringModel;
};
Model.prototype.__fromJSON = function(jsonModel) {
	try {
		var myModel = JSON.parse(jsonModel);
	} catch(err) {
		return err;
	}
	this.__name = myModel.__name;
	for (var n in myModel.__definition) {
		this.__defineProperty(myModel.__definition[n].name, myModel.__definition[n]);
	}
	return this;
};
Model.prototype.__generateParameterValidation = function(mode, list) {
	var thisModel = this;
	var model = this.__definition;
	var parameters = {};
	var tmp = [];
	var propName = '';
	var modelPropName = '';
	if (mode === '+' || mode === 'accept') {
		for (var n=0;n<list.length;n+=1) {
			modelPropName = list[n].split(' as ')[0];
			tmp = thisModel.__resolveDotString(model, modelPropName)
			if (tmp instanceof Error) {
				console.log(tmp);
				return tmp;
			}
			propName = tmp[0].split('.').pop();
			if (list[n].indexOf(' as ') > -1) {
				propName = list[n].split(' as ')[1];
			}
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
Model.prototype.__resolveDotString = function(obj, dotString) {
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



Model.prototype.__create = function() {
	var instance = {};
	instance.__model = this;
	for (var n in this.__definition) {
		if (typeof this.__definition[n].deep === true) {
			continue;
		} else if (typeof this.__definition[n].example === 'function') {
			instance[n] = this.__definition[n].example();
		} else if (typeof this.__definition[n].example !== 'undefined') {
			instance[n] = this.__definition[n].example;
		} else if (typeof this.__definition[n].default === 'function') {
			instance[n] = this.__definition[n].default();
		} else if (typeof this.__definition[n].default !== 'undefined') {
			instance[n] = this.__definition[n].default;
		}
	}
	return instance;
};
Model.prototype.__render = function() {
	return this.__definition;
};
Model.prototype.__defineProperty = function(name, specs) {
	var thisModel = this;
	var fullSpecs = {
		name: name,
		description: '',
		optional: true,
		deep: false,
		example: null,
		default: function() { return null; },
		validate: function() { return null; },
		filter: function(value) {
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
	thisModel.__definition[name] = createPropertiesFromDotString(this.__definition, name, fullSpecs);
	this[name] ={
		validate: function(value) {
			return thisModel.__definition[name].validate(value);
		},
		schema: function() {
			return thisModel.__definition[name];
		}
	};
	return this;
};


Model.prototype.__instance = function(instance) {
	var thisModel = this;
	return {
		get: function(property) {
			if (typeof instance[property] !== 'undefined') {
				return instance[property];
			}
			if (typeof thisModel.__definition[property] === 'undefined') {
				return new Error('unknown property: ' + property);
			}
			return thisModel.__definition[property].default();
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
			return thisModel.__definition[property].__validate(value);
		},
		filter: function(userState, data, model) {
			var filteredProperty = null;
			var stateFilters = null;
			var valueFilter = null;
			var filteredResult = {};
			data = data || instance;
			model = model || thisModel.__definition;
			if (data === null) {
				return null;
			}
			for (var p in data) {
				if (typeof model[p] === 'undefined') {
					continue;
				}
				stateFilters = model[p].filter(data[p]);
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








module.exports = ModelWrapper;
