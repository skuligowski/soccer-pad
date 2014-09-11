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
		
		addPlayer: function(player) {
			return query('INSERT INTO players SET ?', player);
		},

		setPlayerStatus: function(playerUid, status) {
			return query('UPDATE players SET status = ? WHERE uid = ?', [status, playerUid]);
		},

		findGames: function() {
			return query('SELECT * FROM games ORDER BY date DESC');
		},

		findGamesForRatingPeriod: function(periodUid) {
			return query('SELECT g.* FROM games g, rating_periods p WHERE g.date BETWEEN p.fromDate AND p.toDate AND p.uid = ? ORDER BY g.date ASC', periodUid);
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
			return query('SELECT * FROM rating_periods p WHERE ? BETWEEN p.fromDate AND p.toDate ORDER BY p.toDate DESC', gameDate);
		},

		findAllRatingPeriods: function() {
			return query('SELECT * FROM rating_periods p ORDER BY p.toDate DESC');
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

		createMonthlyPeriod: function(date) {
			return query("INSERT IGNORE INTO rating_periods VALUES (" +
				"DATE_FORMAT(?, '%Y%m'), " +
				"DATE_FORMAT(?, 'Month: %Y-%m'), " +
				"DATE_FORMAT(?, '%Y-%m-01 00:00:00'), " +
				"DATE_FORMAT(?, '%Y-%m-01 00:00:00') + INTERVAL 1 MONTH - INTERVAL 1 SECOND)", [date, date, date, date]);
		},

		generateMonthlyPeriods: function() {
			return query("DELETE FROM rating_periods WHERE uid != 'overall'").then(function() {
				return query("INSERT INTO rating_periods " +
					"SELECT uid, title, fromDate, fromDate + INTERVAL 1 MONTH - INTERVAL 1 SECOND toDate FROM ( " +
						"SELECT " +
							"DATE_FORMAT(date, '%Y%m') uid, " +
							"DATE_FORMAT(date, 'Month: %Y-%m') title, " +
							"DATE_FORMAT(date, '%Y-%m-01 00:00:00') fromDate " +
						"FROM games GROUP BY YEAR(date), MONTH(date) " +
					") fd");
			})
		}
	}
}