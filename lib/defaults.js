var fs = require('fs');
var path = __dirname + '/defaults/';
var fileNames = fs.readdirSync(path);
var defaults = {};
var imp = {};
for (var n=0; n<fileNames.length; n+=1) {
	imp = require(path + fileNames[n]);
	defaults[imp.name] = (typeof imp[imp.name] === 'object') ? imp[imp.name] : imp;
};

module.exports = defaults;