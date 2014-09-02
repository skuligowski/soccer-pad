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

var query = function() {
	var deferred = Q.defer(),
		args = [].slice.call(arguments);
	
	args.push(function(err, rows) {
		if (err)
			console.log(err);
		return err ? deferred.reject(err) : deferred.resolve(rows);
	});

	pool.query.apply(pool, args);
	return deferred.promise;
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

exports.findPlayers = function() {
	return query('SELECT * FROM players');
}

exports.findGames = function() {
	return query('SELECT id, date, blueDefender, blueAttacker, \
		whiteDefender, whiteAttacker, blueScore, whiteScore FROM games ORDER BY date DESC');
}

exports.insertGame = function(game) {
	game.date = new Date();
	return query('INSERT INTO games SET ?', game).then(function(insert) {
		game.id = insert.insertId;
		return game;
	});
}

exports.findRatingPeriods = function(gameDate) {
	gameDate.setMilliseconds(0);
	return query('SELECT p.uid FROM rating_periods p WHERE ? BETWEEN p.fromDate AND p.toDate', gameDate).
		then(uidFlatValues);
}

exports.findPlayersRatingsMap = function(periods, players) {
	return query('SELECT * FROM ratings r WHERE r.periodUid in (?)', [periods]).then(function(ratings) {
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
}

exports.replacePlayersRatings = function(periodUid, ratings) {
	var queries = [];
	_.forEach(ratings, function(rating) {
		rating.periodUid = periodUid;		
		queries.push(query('REPLACE INTO ratings SET ?', rating));
	})
	return Q.all(queries);
}