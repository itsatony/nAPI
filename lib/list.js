var List = function() {
	this._type = 'List';
	this._lastGotten = 'none';
	this.items = {};
	this.index = [];
};
module.exports = List;


List.prototype.add = function(name, thing) {
	this.items[name] = thing;
	this.index.push(name);
	return this.items;
};


List.prototype.insertAfter = function(referenceName, name, thing) {
	var referencePosition = this.index.indexOf(referenceName);
	var position = (referencePosition+1 < this.index.length) ? referencePosition+1 : this.index.length;
	return this.insert(position, name, thing);
};


List.prototype.insertBefore = function(referenceName, name, thing) {
	var referencePosition = this.index.indexOf(referenceName);
	var position = (referencePosition-1 > -1) ? referencePosition-1 : 0;
	return this.insert(position, name, thing);
};


List.prototype.insert = function(position, name, thing) {
	this.items[name] = thing;
	this.index.splice(position, 0, name);
	return this.items;
};


List.prototype.getLast = function() {
	return this._lastGotten;
};

List.prototype.getNext = function() {
	var nextName = this.index.shift();
	this._lastGotten = nextName;
	if (typeof nextName === 'undefined') {
		return null;
	}
	return { 
		name: nextName, 
		item: this.items[nextName] 
	};
};


List.prototype.remove = function(name) {
	var idx = this.index.indexOf(name);
	if (idx > -1) {
		this.index.splice(idx, 1);
		delete this.items[name];
	}
	return this;
};


List.prototype.sort = function(func) {
	return this.index.sort(func);
};


