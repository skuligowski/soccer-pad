var jst = require('jstrueskill');

var defaultGameInfo = new jst.GameInfo.getDefaultGameInfo(),
	defaultRating = defaultGameInfo.getDefaultRating(),

	calculate = function(playersCollection, gamesCollection, callback) {
		gamesCollection.find().toArray(function(err, games) {
			playersCollection.find().sort({'name': 1}).toArray(function(err, players) {
				var playerMap = {},
					playerRatingMap = {};

				for (var playerIndex in players) {
					var playerId = players[playerIndex]._id,
						player = new jst.Player(playerId);
					playerMap[playerId] = player;
					playerRatingMap[player] = defaultRating;
				}

				for (var gameIndex in games) {
					var game = games[gameIndex],
						rankArray = game.score.blue > game.score.white ? [1,2] : [2,1],
						blueTeam = new jst.Team("blueTeam"),
						whiteTeam = new jst.Team("whiteTeam");

					for (var position in game.table) {
						var currentPlayer = playerMap[game.table[position]];

						(position == 'A' || position == 'B')
							?  whiteTeam.addPlayer(currentPlayer,playerRatingMap[currentPlayer])
							:  blueTeam.addPlayer(currentPlayer,playerRatingMap[currentPlayer]);
					}

					var resultMap  = new jst.FactorGraphTrueSkillCalculator().calculateNewRatings(defaultGameInfo,
						[blueTeam,whiteTeam], rankArray);

					for (var resultKey in resultMap) {
						if (resultMap.hasOwnProperty(resultKey)) {
							playerRatingMap[resultKey] = resultMap[resultKey];
						}
					}
				}

				var idToRatingMap = {};
				for (var playerId in playerMap) {
					if (playerMap.hasOwnProperty(playerId)) {
						var currentRating =  playerRatingMap[playerMap[playerId]];
						idToRatingMap[playerId] = { mean : currentRating.getMean(), sd : currentRating.getStandardDeviation()};
					}
				}

				callback && callback(idToRatingMap);

			});
		});
	};

exports.calculate = function(db, playersCollection, gamesCollection, callback) {
	db.collection('players_ratings').drop();
	calculate(playersCollection, gamesCollection, function(idToRatingMap) {
		console.log(idToRatingMap);
		db.collection('players_ratings').insert(idToRatingMap, callback);
	});
}

exports.find = function(db, playersCollection,  callback) {
	playersCollection.find().sort({'name': 1}).toArray(function(err, players) {
		db.collection('players_ratings').find().toArray(function(err, ratingsArray) {
			var idToRatingMap = ratingsArray[0];
			for (var playerIndex in players) {
				var playerId = players[playerIndex]._id;
				if (!(playerId  in idToRatingMap )) {
					idToRatingMap[playerId] = { mean : defaultRating.getMean(), sd : defaultRating.getStandardDeviation()};
				}
			}
			callback && callback(idToRatingMap);
		});
	});
}

