var EventEmitter = require('events').EventEmitter;

function argumentsToArray(ArgObject) {
	var args = [];
	for (var n in ArgObject) {
		args.push(ArgObject[n]);
	}
	return args;
};

function MetaEvents(name) {
	var events = new EventEmitter();
	events._name = name;
	events.metaEmit = function() {
		var args = argumentsToArray(arguments);
		var eventName = args.shift();
		return events.emit('metaEventEmitted', name, eventName, args);
	};
	events._transmit = function(originalEmitterName, originalEventName, args) {
		var args = argumentsToArray(arguments);
		return events.emit('metaEventEmitted', originalEmitterName, originalEventName, args.pop()[0]);
	};
	events.forwardTo = function(targetEmitter) {
		events.on(
			'metaEventEmitted', 
			function() {
				var myArgs = arguments;
				process.nextTick(
					function() {
						var args = argumentsToArray(myArgs);
						var originalEmitterName = args.shift();
						var originalEventName = args.shift();
						return targetEmitter._transmit(originalEmitterName, originalEventName, args);
					}
				);
			}
		);
	};
	return events;
};

MetaEvents._test = function() {
	console.log('testing MetaEvents...');
	try {
		var a = {};
		a.events = MetaEvents('A');
		a.events.on(
			'metaEventEmitted',
			function() {
				var args = argumentsToArray(arguments);
				console.log('test.A.metaEventEmitted', args);
			}
		);
		a.events.metaEmit('test0', 'a');
		a.b = {};
		a.b.events = MetaEvents('B');
		a.b.events.on(
			'metaEventEmitted',
			function() {
				var args = argumentsToArray(arguments);
				console.log('test.B.metaEventEmitted', args);
			}
		);
		a.b.events.forwardTo(a.events);
		a.b.events.metaEmit('test1', 'b');
		a.b.c = {};
		a.b.c.events = MetaEvents('C');
		a.b.c.events.on(
			'metaEventEmitted',
			function() {
				var args = argumentsToArray(arguments);
				console.log('test.C.metaEventEmitted', args);
			}
		);
		a.b.c.events.forwardTo(a.b.events);
		a.b.c.events.metaEmit('test2', 'c');
	} catch(err) {
		console.error(err.stack);
	}
};

module.exports = MetaEvents;