var jst = require('jstrueskill');
var blueTeam= jst.Team("blueTeam");
var whiteTeam= jst.Team("whiteTeam")


var mapFunction = function() {
	var whiteWin = this.score.white > this.score.blue;
	for(var position in this.table) {
		var whitePosition = position == 'A' | position == 'B',
			o = {
				games: 1,
				win: whitePosition ^ whiteWin ? 0 : 1,
				loss: whitePosition ^ whiteWin ? 1 : 0,
				winA: position == 'A' & whiteWin ? 1 : 0,
				winB: position == 'B' & whiteWin ? 1 : 0,
				winC: position == 'C' & !whiteWin ? 1 : 0,
				winD: position == 'D' & !whiteWin ? 1 : 0,
				lossA: position == 'A' & !whiteWin ? 1 : 0,
				lossB: position == 'B' & !whiteWin ? 1 : 0,
				lossC: position == 'C' & whiteWin ? 1 : 0,
				lossD: position == 'D' & whiteWin ? 1 : 0
			};
		emit(this.table[position], o);
	}
},

reduceFunction = function(user_id, stats) {
	var o = {
		games: 0,
		win: 0,
		loss: 0,
		winA: 0,
		winB: 0,
		winC: 0,
		winD: 0,
		lossA: 0,
		lossB: 0,
		lossC: 0,
		lossD: 0
	};
	for (var i = 0; i < stats.length; i++)
		for(var p in o)
			o[p] += stats[i][p];

	return o;
};

exports.calculateStats = function(db, callback) {
	db.collection('players_stats').drop();
	db.collection('games').mapReduce(
		mapFunction,
		reduceFunction,
		{ out: "players_stats" },
		callback);
}


exports.find = function(db, callback) {
	db.collection('players').find().sort({'name': 1}).toArray(function(err, players) {
		db.collection('players_stats').find().toArray(function(err, stats) {
			var statsMap = {};
			for(var i = 0; i < stats.length; i++) 
				statsMap[stats[i]._id] = stats[i].value;

			for(var i = 0; i < players.length; i++) {
				var stats = statsMap[players[i]._id];
				if (!stats)
					statsMap[players[i]._id] = reduceFunction(players[i]._id, []);
			}

            calculateRatings(db, players, statsMap, callback);


		});
	});
}

calculateRatings = function(db, players, statsMap, callback) {

    db.collection('games').find().sort({'name': 1}).toArray(function(err, games) {
        var idplayerMap = {};
        var gameInfo = new jst.GameInfo.getDefaultGameInfo();
        var playerMap = {},playerRatingMap = {};

        for (var playerIndex in players) {
            var player = new jst.Player([players[playerIndex]._id]);
            playerMap[players[playerIndex]._id] = player;
            playerRatingMap[player] = gameInfo.getDefaultRating();
        }

        for (var gameIndex in games) {
            game = games[gameIndex];

            var rankArray = game.score.blue > game.score.white ? [2,1] : [1,2];

            var blueTeam= new jst.Team("blueTeam");
            var whiteTeam=new jst.Team("whiteTeam");

            for (var position in game.table) {
                var currentPlayer = playerMap[game.table[position]];

                (position == 'A' || position == 'B')
                    ?  blueTeam.addPlayer(currentPlayer,playerRatingMap[currentPlayer])
                    :  whiteTeam.addPlayer(currentPlayer,playerRatingMap[currentPlayer]) ;
            }
            var resultMap  = new jst.FactorGraphTrueSkillCalculator().calculateNewRatings(gameInfo,
                [blueTeam,whiteTeam], rankArray);
            for (var resultKey in resultMap) {
                 playerRatingMap[resultKey] = resultMap[resultKey];
            }
        }

        for (var playerId in playerMap) {
            var currentRating =  playerRatingMap[playerMap[playerId]];
            idplayerMap[playerId] = { mean : currentRating.getMean(), sd : currentRating.getStandardDeviation()};
        }
        callback(players, statsMap, idplayerMap);

    });



}
