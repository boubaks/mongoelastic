'use strict';
var elsClient = require('elasticsearch-client');
var MongoClient = require('mongodb').MongoClient;

function database() {
	this.mongoClient = null;
	this.mongoError = null;
	this.elsClient = null;
	this.elsError = null;
    return (this);
}

database.prototype.init = function (mongoDBHost, mongoDBPort, mongoDBDataBase, elsHost, elsPort) {
	var mongoUrl = 'mongodb://' + mongoDBHost + ':' + mongoDBPort + '/' + mongoDBDataBase;
	MongoClient.connect(mongoUrl, function(err, client) {
		if (err) {
			this.mongoError = err;
			this.mongoClient = null;
		} else {
			console.log('Connected to mongoDB');
			this.mongoClient = client;
			this.mongoError = null;
		}
	}.bind(this));
	new elsClient(elsHost, elsPort, function (client, err) {
		if (client) {
			this.elsClient = client;
			this.elsError = null;
		} else {
			this.elsError = err;
			this.elsClient = null;
		}
	}.bind(this));
};

// index - collection
// type - only for elastic
// id
database.prototype.get = function(index, type, id, callback) {
	var errors = {};
	var responses = {};
    this.elsClient.get(index, type, id, function (error, response) {
		if (error) {
			errors.elastic = error;
			responses.elastic = null;
		} else {
			responses.elastic = response;
			errors.elastic = null;
		}
    	var collection = this.mongoClient.collection(index);
    	collection.findOne({_id: id}, function(error, response) {
			if (error) {
				responses.mongodb = null;
    			errors.mongodb = error;
	    	} else {
    			errors.mongodb = null;
    			responses.mongodb = response;
    		}
    		if (errors.mongodb === null && errors.elastic === null) { errors = null; }
    		callback(errors, responses);
    	});
    }.bind(this));
};

database.prototype.post = function(index, type, object, callback) {
	var errors = {};
	var responses = {};
	this.elsClient.post(index, type, object, function(error, response) {
		if (error) {
			errors.elastic = error;
			responses.elastic = null;
		} else {
			responses.elastic = response;
			errors.elastic = null;
		}
		var collection = this.mongoClient.collection(index);
		collection.insertOne(object, function(err, response) {
			if (error) {
				responses.mongodb = null;
    			errors.mongodb = error;
	    	} else {
    			errors.mongodb = null;
    			responses.mongodb = response;
    		}
    		if (errors.mongodb === null && errors.elastic === null) { errors = null; }
    		callback(errors, responses);
		});
	}.bind(this));
};

database.prototype.delete = function(index, type, id, callback) {
	var errors = {};
	var responses = {};
	this.elsClient.delete(index, type, id, function(error, response) {
		if (error) {
			errors.elastic = error;
			responses.elastic = null;
		} else {
			responses.elastic = response;
			errors.elastic = null;
		}
		var collection = this.mongoClient.collection(index);
		collection.remove({_id: id}, function(err, response) {
			if (error) {
				responses.mongodb = null;
    			errors.mongodb = error;
	    	} else {
    			responses.mongodb = response;
    			errors.mongodb = null;
    		}
    		if (errors.mongodb === null && errors.elastic === null) { errors = null; }
    		callback(errors, responses);
		});
	}.bind(this));
};

// options upsert - Boolean
database.prototype.put = function(index, type, id, object, options, callback) {
	var errors = {};
	var responses = {};
	var elsOptions = options && options.upsert === true ? {upsert: object} : {};
	this.elsClient.put(index, type, id, object, elsOptions, function(error, response) {
		if (error) {
			errors.elastic = error;
			responses.elastic = null;
		} else {
			responses.elastic = response;
			errors.elastic = null;
		}
		var collection = this.mongoClient.collection(index);
		collection.update({_id: id}, object, options, function(err, response) {
			if (error) {
				responses.mongodb = null;
    			errors.mongodb = error;
	    	} else {
    			responses.mongodb = response;
    			errors.mongodb = null;
    		}
    		if (errors.mongodb === null && errors.elastic === null) { errors = null; }
    		callback(errors, responses);
		});
	}.bind(this));
};

/*
	function managePagination(options) {
		var pagination = {
			skip: 0,
			limit: 50
		};
		if (options.$limit && options.$limit > 0) {
			pagination.limit = parseInt(options.$limit);
		}
		if (options.$page && options.$page > 1) {
			pagination.skip = pagination.limit * (options.$page - 1);
		}
		delete (options.$limit);
		delete (options.$page);
		options.from = pagination.skip;
		options.size = pagination.limit;
		return (options);
	}
*/

database.prototype.search = function(index, mongoQuery, elsQuery, options, callback) {
	var errors = {};
	var responses = {};
	// options = managePagination(options);
	options.size = options.size > 0 ? options.size : 50;
	options.from = options.from > 0 ? options.from : 0;
	this.elsClient.search(index, elsQuery, options, function(error, response) {
		if (error) {
			errors.elastic = error;
			responses.elastic = null;
		} else {
			responses.elastic = response;
			errors.elastic = null;
		}
		var collection = this.mongoClient.collection(index);
		var cursor = collection.find(mongoQuery).limit(options.size).skip(options.from).toArray(function(err, response) {
			if (error) {
				responses.mongodb = null;
    			errors.mongodb = error;
	    	} else {
    			responses.mongodb = response;
    			errors.mongodb = null;
    		}
    		if (errors.mongodb === null && errors.elastic === null) { errors = null; }
    		callback(errors, responses);
		});
	}.bind(this));
};

/*
// method deleteByQuery was removed from the core API in ES 2.0.0
database.prototype.deleteByQuery = function(index, mongoQuery, elsQuery, callback) {
	var errors = {};
	var responses = {};
	this.elsClient.deleteByQuery(index, null, elsQuery, function(error, response) {
		if (error) {
			errors.elastic = error;
			responses.elastic = null;
		} else {
			responses.elastic = response;
			errors.elastic = null;
		}
		var collection = this.mongoClient.collection(index);
		collection.remove(mongoQuery, function(err, response) {
			if (error) {
				responses.mongodb = null;
    			errors.mongodb = error;
	    	} else {
    			responses.mongodb = response;
    			errors.mongodb = null;
    		}
    		if (errors.mongodb === null && errors.elastic === null) { errors = null; }
    		callback(errors, responses);
		});
	}.bind(this));
};
*/

database.prototype.count = function(index, mongoQuery, elsQuery, options, callback) {
	var errors = {};
	var responses = {};
	this.elsClient.count(index, elsQuery, options, function(error, response) {
		if (error) {
			errors.elastic = error;
			responses.elastic = null;
		} else {
			responses.elastic = response;
			errors.elastic = null;
		}
		var collection = this.mongoClient.collection(index);
		collection.count(mongoQuery, options, function(err, response) {
			if (error) {
				responses.mongodb = null;
    			errors.mongodb = error;
	    	} else {
    			responses.mongodb = response;
    			errors.mongodb = null;
    		}
    		if (errors.mongodb === null && errors.elastic === null) { errors = null; }
    		callback(errors, responses);
		});
	}.bind(this));
};

var database = module.exports = exports = new database;