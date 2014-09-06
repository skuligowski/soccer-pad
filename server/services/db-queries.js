var _ = require('lodash');
var Q = require('q');

var valuesOf = function(key) {
	return function(objects) {
		var arr = [];
		for(var i = 0; i < objects.length; i++)
			arr[i] = objects[i][key];
		return arr;
	}
}

var toRatingsMap = function(ratings) {
	var map = {};
	for(var i = 0; i < ratings.length; i++) {
		var rating = ratings[i];
			periodsMap = map[rating['periodUid']];
		if (!periodsMap)
			map[rating['periodUid']] = periodsMap = {};
		periodsMap[rating['playerUid']] = rating;
	}
	return map;
}

var uidFlatValues = valuesOf('uid');

exports.getDb = function(query) {
	return {

		findPlayers: function() {
			return query('SELECT * FROM players');			
		},

		findGames: function(order) {
			return query('SELECT id, date, blueDefender, blueAttacker, \
				whiteDefender, whiteAttacker, blueScore, whiteScore FROM games ORDER BY date ' + (order || 'DESC'));
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

		findAllRatingPeriods: function() {
			return query('SELECT p.uid FROM rating_periods p ORDER BY p.uid DESC').
				then(uidFlatValues);
		},
 
		findPlayersRatingsMap: function(periods) {
			return query('SELECT * FROM ratings r WHERE r.periodUid in (?) FOR UPDATE', [periods]).
				then(toRatingsMap);
		},

		findAllRatingsMap: function() {
			return query('SELECT * FROM ratings').
				then(toRatingsMap);
		},

		replacePlayersRatings: function(periodUid, ratings) {
			var queries = [];
			_.forEach(ratings, function(rating) {
				rating.periodUid = periodUid;		
				queries.push(query('REPLACE INTO ratings SET ?', rating));
			})
			return Q.all(queries);
		},

		clearRatings: function() {
			return query('DELETE FROM ratings');
		},

		findAllRatingPeriods: function() {
			return query('SELECT p.uid FROM rating_periods p').
				then(uidFlatValues);
		}

	}
}