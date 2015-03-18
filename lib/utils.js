var fs = require('fs');
var path = __dirname + '/utils/';
var fileNames = fs.readdirSync(path);
var defaults = {};
var imp = {};
for (var n=0; n<fileNames.length; n+=1) {
	imp = require(path + fileNames[n]);
	defaults[imp.name] = imp;
};

module.exports = defaults;