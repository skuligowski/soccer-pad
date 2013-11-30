var jst = require('jstrueskill');

exports.calculate = function(db, callback) {
    db.collection('players_ratings').drop();
    db.collection('games').find().sort({'name': 1}).toArray(function(err, games) {
        db.collection('players').find().sort({'name': 1}).toArray(function(err, players) {
            var gameInfo = new jst.GameInfo.getDefaultGameInfo()
              , playerMap = {}
              , playerRatingMap = {};

            for (var playerIndex in players) {
                var playerId = players[playerIndex]._id
                  , player = new jst.Player(playerId);
                playerMap[playerId] = player;
                playerRatingMap[player] = gameInfo.getDefaultRating();
            }

            for (var gameIndex in games) {
                var game = games[gameIndex]
                  , rankArray = game.score.blue > game.score.white ? [1,2] : [2,1]
                  , blueTeam = new jst.Team("blueTeam")
                  , whiteTeam = new jst.Team("whiteTeam");

                for (var position in game.table) {
                    var currentPlayer = playerMap[game.table[position]];

                    (position == 'A' || position == 'B')
                        ?  whiteTeam.addPlayer(currentPlayer,playerRatingMap[currentPlayer])
                        :  blueTeam.addPlayer(currentPlayer,playerRatingMap[currentPlayer]) ;
                }

                var resultMap  = new jst.FactorGraphTrueSkillCalculator().calculateNewRatings(gameInfo,
                    [blueTeam,whiteTeam], rankArray);

                for (var resultKey in resultMap) {
                    if (resultMap.hasOwnProperty(resultKey)) {
                        playerRatingMap[resultKey] = resultMap[resultKey];
                    }
                }
            }

            var idplayerMap = {};
            for (var playerId in playerMap) {
                var currentRating =  playerRatingMap[playerMap[playerId]];
                idplayerMap[playerId] = { mean : currentRating.getMean(), sd : currentRating.getStandardDeviation()};
            }

            db.collection('players_ratings').insert(idplayerMap, callback);

        });
    });
}

exports.find = function(db,  callback) {
    db.collection('players_ratings').find().toArray(function(err, ratings) {
         callback(ratings[0]);
    });
}

