var mysql = require('mysql');
var Q = require('q');
var pool = mysql.createPool({
  connectionLimit: 5,
  host: 'localhost',
  database: 'soccer_pad',
  user: 'root',
  password: ''
});

var query = function() {
	var deferred = Q.defer(),
		args = [].slice.call(arguments);
	
	args.push(function(err, rows) {		
		return err ? deferred.reject(err) : deferred.resolve(rows);
	});

	pool.query.apply(pool, args);
	return deferred.promise;
}

exports.findPlayers = function() {
	return query('SELECT * FROM players');
}

exports.findGames = function() {
	return query('SELECT id, DATE_FORMAT(gameDate, "%Y-%m-%d %H:%i:%s") date, \
		blueDefender, blueAttacker, whiteDefender, whiteAttacker, blueScore, \
		whiteScore FROM games ORDER BY gameDate DESC');
}