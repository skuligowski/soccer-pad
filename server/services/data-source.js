var mysql = require('mysql');
var Q = require('q');
var pool = mysql.createPool({
  dateStrings: false,
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
	return query('SELECT id, date, blueDefender, blueAttacker, \
		whiteDefender, whiteAttacker, blueScore, whiteScore FROM games ORDER BY date DESC');
}

exports.insertGame = function(game) {
	return query('INSERT INTO games SET ?', game);
}