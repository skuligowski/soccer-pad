var jst = require('jstrueskill'),
	_ = require('lodash');


var defaultGameInfo = new jst.GameInfo.getDefaultGameInfo()
	defaultRating = defaultGameInfo.getDefaultRating(),

	simpleStrategy = function(playerId) {
		var player = new jst.Player(playerId);
		
		return {
			attacker: player,
			defender: player
		};
	},

	attackerDefenderStrategy = function(playerId) {
		var attackerId = 'attacker:' + playerId,
			defenderId = 'defender:' + playerId, 
			attacker = new jst.Player(attackerId),
			defender = new jst.Player(defenderId);
		
		return {
			attacker: attacker,
			defender: defender
		};
	},



    calculateGoals = function(players, games, strategy, goalFraction) {
		var attackerMap = {},
			defenderMap = {},
			playerRatingMap = {},

            goalGameInfo = new jst.GameInfo(defaultGameInfo.initialMean*goalFraction, defaultGameInfo.initialStandardDeviation*goalFraction, defaultGameInfo.beta*goalFraction,
		        defaultGameInfo.dynamicsFactor, 0.1);
            console.log(goalGameInfo);

		for (var playerIndex in players) {
			var playerId = players[playerIndex]._id,
				player = strategy(playerId);
			attackerMap[playerId] = player.attacker;
			defenderMap[playerId] = player.defender;
			playerRatingMap[player.attacker] = playerRatingMap[player.defender] = defaultRating;
		}

		for (var gameIndex in games) {
            var game = games[gameIndex],
                scoreDiff = game.score.blue - game.score.white,
			    rankArray = scoreDiff > 0 ? [1, 2] : [2, 1],
                absScoreDiff  = Math.abs(scoreDiff);

			for (var i = 0; i < absScoreDiff; i++ ) {
                var	blueTeam = new jst.Team("blueTeam"),
                    whiteTeam = new jst.Team("whiteTeam");


                for (var position in game.table) {
                    var currentPlayer = (position == 'A' || position == 'D')
                        ? defenderMap[game.table[position]]
                        : attackerMap[game.table[position]];

                    (position == 'A' || position == 'B')
                        ? whiteTeam.addPlayer(currentPlayer, playerRatingMap[currentPlayer])
                        : blueTeam.addPlayer(currentPlayer, playerRatingMap[currentPlayer]);
                }


                var resultMap = new jst.FactorGraphTrueSkillCalculator().calculateNewRatings(goalGameInfo,
                    [blueTeam,whiteTeam], rankArray);
                for (var resultKey in resultMap) {
                    if (resultMap.hasOwnProperty(resultKey)) {
                        playerRatingMap[resultKey] = resultMap[resultKey];
                    }
                }
            }                             /*
            for (var i = 0; i < 10-absScoreDiff; i++ ) {
                var resultMap = new jst.FactorGraphTrueSkillCalculator().calculateNewRatings(goalGameInfo,
                    [blueTeam,whiteTeam], [1, 1] );
                for (var resultKey in resultMap) {
                    if (resultMap.hasOwnProperty(resultKey)) {
                        playerRatingMap[resultKey] = resultMap[resultKey];
                    }
                }
            }                               */

		}

		function prepareRatingMap(playerMap) {
			var idToRatingMap = {};
			for (var playerId in playerMap) {
				if (playerMap.hasOwnProperty(playerId)) {
					var currentRating =  playerRatingMap[playerMap[playerId]];
					idToRatingMap[playerId] = { mean : currentRating.getMean(), sd : currentRating.getStandardDeviation()};
				}
			}
			return idToRatingMap;
		}

		return {
			attackers: prepareRatingMap(attackerMap),
			defenders: prepareRatingMap(defenderMap)
		};
	};

	calculate = function(players, games, strategy, threshold) {
		var attackerMap = {},
			defenderMap = {},
			playerRatingMap = {};

		for (var playerIndex in players) {
			var playerId = players[playerIndex]._id,
				player = strategy(playerId);
			attackerMap[playerId] = player.attacker;
			defenderMap[playerId] = player.defender;
			playerRatingMap[player.attacker] = playerRatingMap[player.defender] = defaultRating;
		}

		for (var gameIndex in games) {
			var game = games[gameIndex],
				blueTeam = new jst.Team("blueTeam"),
				whiteTeam = new jst.Team("whiteTeam"),
				scoreDiff = game.score.blue - game.score.white,
				rankArray = scoreDiff > threshold ? [1, 2] : scoreDiff < -threshold ? [2, 1] : [1, 1];

			for (var position in game.table) {
				var currentPlayer = (position == 'A' || position == 'D') 
					? defenderMap[game.table[position]]
					: attackerMap[game.table[position]];

				(position == 'A' || position == 'B')
					? whiteTeam.addPlayer(currentPlayer, playerRatingMap[currentPlayer])
					: blueTeam.addPlayer(currentPlayer, playerRatingMap[currentPlayer]);
			}

			var resultMap = new jst.FactorGraphTrueSkillCalculator().calculateNewRatings(defaultGameInfo,
				[blueTeam,whiteTeam], rankArray);

			for (var resultKey in resultMap) {
				if (resultMap.hasOwnProperty(resultKey)) {
					playerRatingMap[resultKey] = resultMap[resultKey];
				}
			}
		}

		function prepareRatingMap(playerMap) {
			var idToRatingMap = {};
			for (var playerId in playerMap) {
				if (playerMap.hasOwnProperty(playerId)) {
					var currentRating =  playerRatingMap[playerMap[playerId]];
					idToRatingMap[playerId] = { mean : currentRating.getMean(), sd : currentRating.getStandardDeviation()};
				}
			}
			return idToRatingMap;
		}

		return {
			attackers: prepareRatingMap(attackerMap), 
			defenders: prepareRatingMap(defenderMap)
		};
	};

exports.calculate = function(db, playersCollection, gamesCollection, callback) {
	db.collection('players_ratings').drop();

	gamesCollection.find().toArray(function(err, games) {
		playersCollection.find().sort({'name': 1}).toArray(function(err, players) {
			var ratings = {};
			ratings['T0'] = _.extend({overall: calculate(players, games, simpleStrategy, 0).attackers}, 
				calculate(players, games, attackerDefenderStrategy, 0));

			ratings['T2'] = _.extend({overall: calculate(players, games, simpleStrategy, 2).attackers},
				calculate(players, games, attackerDefenderStrategy, 2));
			ratings['T4'] = _.extend({overall: calculate(players, games, simpleStrategy, 4).attackers},
			  calculate(players, games, attackerDefenderStrategy, 4));
            ratings['G5'] = _.extend({overall: calculateGoals(players, games, simpleStrategy,5).attackers},
			  calculateGoals(players, games, attackerDefenderStrategy,5));
            ratings['G10'] = _.extend({overall: calculateGoals(players, games, simpleStrategy,10).attackers},
			  calculateGoals(players, games, attackerDefenderStrategy,10));


			db.collection('players_ratings').insert(ratings, callback);
		});
	});
};

exports.find = function(db, playersCollection, callback) {
	playersCollection.find().sort({'name': 1}).toArray(function(err, players) {
		db.collection('players_ratings').find().toArray(function(err, ratingsArray) {
			var ratings = ratingsArray[0];

			addMissingPlayers(ratings['T0'].overall, players,1);
			addMissingPlayers(ratings['T0'].attackers, players,1);
			addMissingPlayers(ratings['T0'].defenders, players,1);
			addMissingPlayers(ratings['T2'].overall, players,1);
			addMissingPlayers(ratings['T2'].attackers, players,1);
			addMissingPlayers(ratings['T2'].defenders, players,1);
			addMissingPlayers(ratings['T4'].overall, players,1);
			addMissingPlayers(ratings['T4'].attackers, players,1);
			addMissingPlayers(ratings['T4'].defenders, players,1);
            addMissingPlayers(ratings['G5'].overall, players,5);
			addMissingPlayers(ratings['G5'].attackers, players,5);
			addMissingPlayers(ratings['G5'].defenders, players,5);
            addMissingPlayers(ratings['G10'].overall, players,10);
			addMissingPlayers(ratings['G10'].attackers, players,10);
			addMissingPlayers(ratings['G10'].defenders, players,10);

			callback && callback(ratings);
		});
	});

	function addMissingPlayers(idToRatingMap, players,factor) {
		for (var playerIndex in players) {
			var playerId = players[playerIndex]._id;
			if (!(playerId in idToRatingMap)) {
				idToRatingMap[playerId] = { mean : defaultRating.getMean()*factor, sd : defaultRating.getStandardDeviation()*factor};
			}
		}
	}
};

