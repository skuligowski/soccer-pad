var mysql = require('mysql');
var _ = require('lodash');
var Q = require('q');
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

var getQuery = function(connection) {
	return function() {
		var deferred = Q.defer(),
			args = [].slice.call(arguments);

		args.push(resultCallback(connection, deferred));

		connection.query.apply(connection, args);
		return deferred.promise;
	}
}

exports.conn = function(callback) {
	pool.getConnection(function(err, connection) {
		if (err) throw err;
		
		var db = getDb(getQuery(connection));
		db.close = function() {
			connection.release();
		}
		callback(db);
	});	
}

exports.begin = function(callback) {
	pool.getConnection(function(err, connection) {
		if (err) throw err;
		
		connection.beginTransaction(function(err) {
  			if (err) throw err;
		
			var db = getDb(getQuery(connection));
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

var valuesOf = function(key) {
	return function(objects) {
		var arr = [];
		for(var i = 0; i < objects.length; i++)
			arr[i] = objects[i][key];
		return arr;
	}
}

var uidFlatValues = valuesOf('uid');

var getDb = function(query) {
	return {

		findPlayers: function() {
			return query('SELECT * FROM players');			
		},

		findGames: function() {
			return query('SELECT id, date, blueDefender, blueAttacker, \
				whiteDefender, whiteAttacker, blueScore, whiteScore FROM games ORDER BY date DESC');
		},

		insertGame: function(game) {
			game.date = new Date();
			return query('INSERT INTO games SET ?', game).then(function(insert) {
				game.id = insert.insertId;
				return game;
			});
		},

		findRatingPeriods: function(gameDate) {
			gameDate.setMilliseconds(0);
			return query('SELECT p.uid FROM rating_periods p WHERE ? BETWEEN p.fromDate AND p.toDate', gameDate).
				then(uidFlatValues);
		},

		findPlayersRatingsMap: function(periods) {
			return query('SELECT * FROM ratings r WHERE r.periodUid in (?) FOR UPDATE', [periods]).then(function(ratings) {
				var map = {};
				for(var i = 0; i < ratings.length; i++) {
					var rating = ratings[i];
						periodsMap = map[rating['periodUid']];
					if (!periodsMap)
						map[rating['periodUid']] = periodsMap = {};
					periodsMap[rating['playerUid']] = rating;
				}
				return map;
			});
		},

		replacePlayersRatings: function(periodUid, ratings) {
			var queries = [];
			_.forEach(ratings, function(rating) {
				rating.periodUid = periodUid;		
				queries.push(query('REPLACE INTO ratings SET ?', rating));
			})
			return Q.all(queries);
		}

	}
}

