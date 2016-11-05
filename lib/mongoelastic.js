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
		} else {
			console.log('Connected to mongoDB');
			this.mongoClient = client;
		}
	}.bind(this));
	new elsClient(elsHost, elsPort, function (client, err) {
		if (client) {
			this.elsClient = client;
		} else {
			this.elsError = err;
		}
	}.bind(this));
}

// index - collection
// type - only for elastic
// id
database.prototype.get = function(index, type, id, callback) {
	var errors = {};
	var responses = {};
    this.elsClient.get(index, type, id, function (error, response) {
    	if (error) {
    		errors.elastic = error;
    	} else {
    		responses.elastic = response;
    	}
    	var collection = this.mongoClient.collection(index);
    	collection.findOne({_id: id}, function(error, response) {
			if (error) {
    			errors.mongodb = error;
	    	} else {
    			responses.mongodb = response;
    		}
    		callback(errors, responses);
    	});
    }.bind(this));
};

/*
database.prototype.search = function(index, query, options, callback) {
};

database.prototype.findAndModify = function(index, type, query, object, options, callback) {
};

database.prototype.put = function(index, type, id, object, options, callback) {
};

database.prototype.post = function(index, type, object, callback) {
};

database.prototype.delete = function(index, type, id, callback) {
};

database.prototype.deleteByQuery = function(index, type, query, callback) {
}

database.prototype.createIndice = function(index, callback) {
};

database.prototype.deleteIndice = function(index, callback) {
};

database.prototype.count = function(index, query, options, callback) {
};
*/

var database = module.exports = exports = new database;