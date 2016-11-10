var events = require('events');
var eventEmitter = new events.EventEmitter();
var mongoelastic = require(__dirname + '/index');

mongoelastic.init("localhost", 27017, "test", "localhost", 9200)

var exit = function exit() {
	process.exit();
}

var putRequest = function putRequest() {
	console.log('*********** PUT ***********');
	mongoelastic.put("test", "test", 1, {_id: 1, test: 500}, {upsert: true}, function(err, response) {
		if (err) { console.log('error', err); eventEmitter.emit('exit'); } else {
			console.log('mongoDB', response.mongodb.result);
			console.log('elasticsearch', response.elastic);
			eventEmitter.emit('get')
		}
	});
};

var deleteRequest = function deleteRequest() {
	console.log('*********** DELETE ***********');
	mongoelastic.delete("test", "test", 1, function(err, response) {
		if (err) { console.log('error', err); eventEmitter.emit('exit'); } else {
			console.log('mongoDB', response.mongodb.result);
			console.log('elasticsearch', response.elastic);
			eventEmitter.emit('get')
		}
	});
};

var postRequest = function posttRequest() {
	console.log('*********** POST ***********');
	mongoelastic.post("test", "test", {"_id": 1, "test": 1}, function(err, response) {
		if (err) { console.log('error', err); eventEmitter.emit('exit'); } else {
			console.log('mongoDB', response.mongodb.result);
			console.log('elasticsearch', response.elastic);
			eventEmitter.emit('get')
		}
	});
};

var iterator = 0;
var mappingEmit = ['put', 'delete', 'exit'];

var getRequest = function getRequest() {
	// time to insert
	console.log('*********** GET ***********');
	setTimeout(function() { 
		mongoelastic.get("test", "test", 1, function(err, response) {
			if (err) { console.log('error', err); eventEmitter.emit('exit'); } else {
				console.log('mongoDB', response.mongodb);
				console.log('elasticsearch', response.elastic);
			}
			eventEmitter.emit(mappingEmit[iterator]);
			++iterator;
		});
	}, 1000);
};

/*
** Flow test

** post
** get
** put
** get
** delete
** get
** exit
*/

eventEmitter.addListener('post', postRequest);
eventEmitter.addListener('put', putRequest);
eventEmitter.addListener('get', getRequest);
eventEmitter.addListener('delete', deleteRequest);
eventEmitter.addListener('exit', exit);

setTimeout(function() {
	eventEmitter.emit('post');
}, 1000);