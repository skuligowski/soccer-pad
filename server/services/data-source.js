var mysql = require('mysql');
var _ = require('lodash');
var Q = require('q');
var getDb = require('./db-queries').getDb;

var pool = mysql.createPool({
  dateStrings: false,
  connectionLimit: 5,
  host: 'localhost',
  database: 'soccer_pad',
  user: 'root',
  password: ''
});

var resultCallback = function(connection, deferred) {
	return function(err, result) {
		if (err) {
			connection.rollback(function() {
				console.log(err);		
				connection.release();		
			})
			return deferred.reject(err);
		}
		return deferred.resolve(result);
	};
}

var getConnectionQuery = function(connection) {
	return function() {
		var deferred = Q.defer(),
			args = [].slice.call(arguments);
		
		args.push(resultCallback(connection, deferred));

		connection.query.apply(connection, args);
		return deferred.promise;
	}
}

var getPooledQuery = function() {
	return function() {
		var deferred = Q.defer(),
			args = [].slice.call(arguments);

		args.push(function(err, result) {
			if (err)
				console.log(err);
			return err ? deferred.reject(err) : deferred.resolve(result);
		});

		pool.query.apply(pool, args);
		return deferred.promise;
	}
}

var begin = function(callback) {
	pool.getConnection(function(err, connection) {
		if (err) throw err;
		
		connection.beginTransaction(function(err) {
  			if (err) throw err;
		
			var db = getDb(getConnectionQuery(connection));
			db.commit = function() {
				connection.commit(function(err) {
					if (err) { 
						connection.rollback(function() {
							connection.release();
						});
					} else {
						connection.release();
					}					
				});
			}
			db.rollback = function() {
				connection.rollback(function() {
					connection.release();					
				});				
			}
			callback(db);
		});
	});	
}

exports.begin = begin;
_.assign(exports, getDb(getPooledQuery()));
