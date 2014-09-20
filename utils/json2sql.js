var fs = require('fs'),
	dataSource = require('../server/services/data-source'),
	Q = require('q'),
	_ = require('lodash'),
	unidecode = require('unidecode'),
	soccer = require('../server/services/soccer-manager'),
	db = dataSource(function(query) {
		return {
			insertGame: function(game) {
				return query('INSERT INTO games SET ?', game);
			},
			deletePlayers: function() {
				return query('DELETE FROM PLAYERS');
			},
			deleteGames: function() {
				return query('DELETE FROM GAMES');
			}
		};
	});
	
function readFile(pathToFile) {
  var deferred = Q.defer();
  fs.readFile(pathToFile, function (err, data) {
    var jsonArray = _.map(_.compact(data.toString().split('\n')), function(item) {
    	return JSON.parse(item);
    });
    deferred.resolve(jsonArray);
  });
  return deferred.promise;
}

readFile('playersx.json')
.then(function(players) {
	return _.mapValues(_.groupBy(players, function(player) {
		return player._id.$oid;
	}), function(items) {
		return {
			name: items[0].name,
			uid: unidecode(items[0].name.toLowerCase().replace(/[ \.]/g, ""))
		};
	});
}).then(function(playersMap) {
	return readFile('gamesx.json').then(function(games) {
		return _.map(games, function(game) {
			return {
				blueDefender: playersMap[game.table.A].uid,
				blueAttacker: playersMap[game.table.B].uid,
				whiteDefender: playersMap[game.table.C].uid,
				whiteAttacker: playersMap[game.table.D].uid,
				blueScore: game.score.blue,
				whiteScore: game.score.white,
				date: new Date(game.date.$date)
			};
		});		
	}).then(function(games) {
		return db.deleteGames()
		.then(db.deletePlayers)
		.then(function() {
			return Q.all(_.map(playersMap, function(player) {
				return soccer.addPlayer(player);
			})).then(function() {			
				return Q.all(_.map(games, function(game) {
					return db.insertGame(game);
				}))
				.then(soccer.recalculateRatings)
				.then(db.destroy)
				.catch(function(err) {
					console.log(err)
				});
			});
		});
	})
})
