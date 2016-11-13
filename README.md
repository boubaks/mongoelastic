# mongoelastic
use mongodb and elasticsearch on the same DB object

## Installation
npm install mongoelastic


## Connect
    
    var mongoelastic = require('mongoelastic');

    /*
    ** init method
    ** mongoUrl (string)
    ** mongoPort (integer)
    ** mongoDB (string)
    ** elasticUrl (string)
    ** elasticPort (integer)
    */
	mongoelastic.init('localhost', 27017, 'test', 'localhost', 9200)

## Documents : post, put, get, delete, search & count

	/*
	**  index (string) elasticsearch index ~ mongodb collection
	**  type (string) elasticsearch type ~ useless for mongodb
	**  id (string) document id
	**  callback (function)
	*/
	mongoelastic.get('test', 'test', 1, function(err, response) {
		// get document from test index or test collection with id equal to 1
	});

	/*
	**  index (string) elasticsearch index ~ mongodb collection
	**  type (object) elasticsearch type ~ useless for mongodb
	**  object (object) the object that you want to insert 
	**  callback (function)
	*/
	mongoelastic.post('test', 'test', {'_id': 1, 'test': 1}, function(err, response) {
		// adding test document /test/test/1
	});

	/*
	**  index (string) elasticsearch index ~ mongodb collection
	**  type (object) elasticsearch type ~ useless for mongodb
	**  id (string) document id
	**  object (object) the object that you want to insert or partial update
	**  options (object) { upsert: {text: 'Hello !'}, }
	**  callback (function)
	*/
	mongoelastic.put('test', 'test', 1, {_id: 1, test: 500}, {upsert: true}, function(err, response) {
		// adding test document /test/test/1 with upsert option
	});

	/*
	**  index (string) elasticsearch index ~ mongodb collection
	**  type (string) elasticsearch type ~ useless for mongodb
	**  id (string) document id
	**  callback (function)
	*/
	mongoelastic.delete('test', 'test', 1, function(err, response) {
		// delete test document with id equal to 1
	});

	/*
	**  index (string) elasticsearch index ~ mongodb collection
	**  mongoQuery (object) object used for querying on mongodb
	** 	elsQuery (object or string) object used for querying on elasticsearch
	**  options (object) { type: '...', } adding some specific options for search
	**  callback (function)
	*/
	mongoelastic.count('test', {test: 500}, 'test:500', null, function(err, response) {
		// count the number of document with query test equal to 500
	});

	/*
	**  index (string) elasticsearch index ~ mongodb collection
	**  mongoQuery (object) object used for querying on mongodb
	** 	elsQuery (object or string) object used for querying on elasticsearch
	**  options (object) { size: 100, from: 200} adding some specific options for search
	**  callback (function)
	*/
	mongoelastic.search('test', {test: 500}, 'test:500', { size: 10, from: 0 } , function(err, response) {
		// search documents on mongoQuery (for mongodb) and elsQuery (for elasticsearch)
	});
  
## Trace & Debug mode
  You can set PROCESS.env.ELSLOG = true. This option active the ['trace', 'error'] "log" on elasticsearch client.