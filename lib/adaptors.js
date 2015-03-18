var fs = require('fs');
var path = __dirname + '/adaptors/';
var fileNames = fs.readdirSync(path);
var adaptors = {};
var imp = {};
for (var n=0; n<fileNames.length; n+=1) {
	imp = require(path + fileNames[n]);
	adaptors[imp.name] = (typeof imp[imp.name] === 'object') ? imp[imp.name] : imp;
};

module.exports = adaptors;
