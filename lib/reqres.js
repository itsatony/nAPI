// https://github.com/hapijs/qs

// https://github.com/felixge/node-formidable

// https://www.npmjs.org/package/response-send

// https://github.com/jaredhanson/node-response-redirect

// https://github.com/archyta/node-response-send

// https://github.com/expressjs/cookie-parser

// https://github.com/pillarjs/router


// https://github.com/senchalabs/connect

/*

reqres  is a nAPI module that takes care of the steps BEFORE and AFTER the napi runs

the req part takes incoming requests, being e.g. http or ws or intra-code and unifies them

the res part takes api results (and errors and warnings) and creates and sends a response .


reqres provides a connectApp.use(middleware) interface

connectApp.use(reqres.unifyRequest.http.toMiddleware());

connectApp.use(reqres.unifyRequest.ws.toMiddleware());


reqres provides napi with this data structure:

request = {
	_original: reqObject,
	_type: 'http',
	cookies: {},
	body: {},
	header: {},
	requestId: '',
	clientId: '',
	resource: 'users',
	method: 'get',
	specifier: 'byId',
	resourceVersion: '1.0.0',
	document: {
		_id: -1
	}
};

response = {
	send: func(data, code, format),
	sendJSON: func(data, code),
	sendXML: func(data, code),
	sendJSONP: func(data, code),
	sendFile: func(buffer, code)
};

*/

var http	= require('http');
var https	= require('https');
var zlib = require('zlib');
