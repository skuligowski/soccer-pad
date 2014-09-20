var mysql = require('mysql');
var _ = require('lodash');
var Q = require('q');

var pool = mysql.createPool({
  dateStrings: false,
  connectionLimit: 10,
  host: 'localhost',
  database: 'soccer_pad',
  user: 'root',
  password: ''
});

module.exports = function() {
	
	var getDbFnList = [].slice.call(arguments),
		getDb = function(query) {
			var dbList = _.map(getDbFnList, function(getDbFn) {
				return getDbFn(query);
			});
			return _.assign.apply(_, dbList);
		};

	var resultCallback = function(connection, deferred) {
		return function(err, result) {
			if (!err)
				return deferred.resolve(result);

			connection.rollback(function() {
				connection.release();
				return deferred.reject(err);
			})
		};
	}

	var getConnectionQuery = function(connection) {
		return function() {
			var deferred = Q.defer(),
				args = [].slice.call(arguments);
			
			console.log('t:'+args[0])
			args.push(resultCallback(connection, deferred));

			connection.query.apply(connection, args);
			return deferred.promise;
		}
	}

	var getPooledQuery = function() {
		return function() {
			var deferred = Q.defer(),
				args = [].slice.call(arguments);
			console.log('c:'+args[0])
			args.push(function(err, result) {
				return err ? deferred.reject(err) : deferred.resolve(result);
			});

			pool.query.apply(pool, args);
			return deferred.promise;
		}
	}

	var destroy = function() {
		pool.end();
	}

	var begin = function(callback) {
		var deferred = Q.defer();
		pool.getConnection(function(err, connection) {
			if (err) 
				return deferred.reject(err);
			
			connection.beginTransaction(function(err) {
	  			if (err) 
	  				return deferred.reject(err);
			
				var db = getDb(getConnectionQuery(connection));
				
				db.commit = function() {
					var deferred = Q.defer();
					connection.commit(function(err) {
						if (err) { 
							connection.rollback(function() {
								connection.release();
								deferred.reject();
							});
						} else {
							connection.release();
							deferred.resolve();
						}					
					});
					return deferred.promise;
				}
				
				db.rollback = function() {
					var deferred = Q.defer();
					connection.rollback(function() {
						connection.release();
						deferred.resolve();					
					});
					return deferred.promise;
				}
				
				db.destroy = destroy;
				
				deferred.resolve(db);
			});
		});
		return deferred.promise;
	}

	return _.assign({ begin: begin, destroy: destroy }, getDb(getPooledQuery()));
}