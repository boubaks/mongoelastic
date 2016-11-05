var mongoelastic = require(__dirname + '/index');

mongoelastic.init("localhost", 27017, "test", "localhost", 9200)

setTimeout(function() {
	mongoelastic.get("test", "test", "1", function(err, response) {
		console.log("arguments", arguments);
	});
}, 2000);
