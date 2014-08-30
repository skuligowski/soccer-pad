var jst = require('jstrueskill');

var defaultGameInfo = new jst.GameInfo.getDefaultGameInfo(),
    defaultRating = defaultGameInfo.getDefaultRating(),
    trueSkillCalculator = new jst.FactorGraphTrueSkillCalculator();

exports.calculate = function(games, lastRatings) {
    var players = {},
        ratings = {},
        lastRatings = lastRatings || {},
        findPlayer = function(playerUid) {
            var player = players[playerUid];
            if (!player) {
                players[playerUid] = player = new jst.Player(playerUid);
                var playerRating = lastRatings[playerUid];
                ratings[player] = playerRating ? 
                    new jst.Rating(playerRating.mean, playerRating.sd) : defaultRating;
            }
            return {
                player: player,
                rating: ratings[player]
            };
        },
        addPlayer = function(team, playerUid) {
            var player = findPlayer(playerUid);
            team.addPlayer(player.player, player.rating);
        };

    for(var i = 0; i < games.length; i++) {
        var game = games[i],
            blueTeam = new jst.Team("blueTeam"),
            whiteTeam = new jst.Team("whiteTeam"),
            rankArray = game.blueScore > game.whiteScore ? [1,2] : [2,1];
        
        addPlayer(blueTeam, game.blueDefender);
        addPlayer(blueTeam, game.blueAttacker);
        addPlayer(whiteTeam, game.whiteDefender);
        addPlayer(whiteTeam, game.whiteAttacker);
        
        var ratingsMap = trueSkillCalculator.calculateNewRatings(defaultGameInfo, [blueTeam, whiteTeam], rankArray);
        for(var player in ratingsMap) {            
            if (ratingsMap.hasOwnProperty(player)) {
                ratings[player] = ratingsMap[player];
            }
        }
    }    
    console.log(ratings);
}

exports.find = function(db, playersCollection,  callback) {
    playersCollection.find().sort({'name': 1}).toArray(function(err, players) {
        db.collection('players_ratings').find().toArray(function(err, ratingsArray) {
            var idToRatingsMap = ratingsArray[0];
            for (var playerIndex in players) {
                var playerId = players[playerIndex]._id;
                if (!(playerId  in idToRatingsMap )) {
                    idToRatingsMap[playerId] = { mean : defaultRating.getMean(), sd : defaultRating.getStandardDeviation()};
                }
            }
            callback && callback(idToRatingsMap);
        });
    });
}

