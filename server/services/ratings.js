var jst = require('jstrueskill'),
    _ = require('lodash');

jst.Player.prototype.toString = function() {
    return this.id;
}

var defaultGameInfo = new jst.GameInfo.getDefaultGameInfo(),
    defaultRating = defaultGameInfo.getDefaultRating(),
    trueSkillCalculator = new jst.FactorGraphTrueSkillCalculator();

exports.calculate = function(games, lastRatingsMap) {  
    console.log(lastRatingsMap);
    var players = {},
        ratings = {},        
        lastRatingsMap = lastRatingsMap || {},

        findPlayer = function(playerUid) {
            var player = players[playerUid];
            if (!player) {
                players[playerUid] = player = new jst.Player(playerUid);
                var playerRating = lastRatingsMap[playerUid];
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
        _.assign(ratings, ratingsMap);
    }    
    
    return _.map(ratings, function(rating, playerUid) {
        return {
            playerUid: playerUid,
            mean: rating.mean,
            sd: rating.standardDeviation
        };
    });
}

