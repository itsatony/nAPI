
var ModelWrap = function(model, instance) {
	this.model = model;
	this.instance = instance;
};


ModelWrap.prototype.get = function(property) {
	if (typeof this.instance[property] !== 'undefined') {
		return this.instance[property];
	}
	if (typeof this.model[property] === 'undefined') {
		return new Error('unknown property: ' + property);
	}
	return this.model[property].default();
};


ModelWrap.prototype.set = function(property, value) {
	var hasError = this.validate(property, value);
	if (hasError !== null) {
		return hasError;
	}
	this.instance[property] = value;
	return this.instance[property];
};


ModelWrap.prototype.validate = function(property, value) {
	return this.model[property].__validate(value);
};


ModelWrap.prototype.filter = function(userState, data, model) {
	var filteredProperty = null;
	var stateFilters = null;
	var valueFilter = null;
	var filteredResult = {};
	data = data || this.instance;
	model = model || this.model;
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
			? valueFilter(results[n][p]) 
			: valueFilter
		;
		filteredResult[p] = filteredProperty;
	}
	return filteredResult;
};


module.exports = ModelWrap;