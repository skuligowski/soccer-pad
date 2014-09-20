var jst = require('jstrueskill'),
    _ = require('lodash');

jst.Player.prototype.toString = function() {
    return this.id;
}

var defaultGameInfo = new jst.GameInfo.getDefaultGameInfo(),
    defaultRating = defaultGameInfo.getDefaultRating(),
    trueSkillCalculator = new jst.FactorGraphTrueSkillCalculator(),
    ratingsList = ['bATotal', 'bAWins', 'bDTotal', 'bDWins', 'wATotal', 'wAWins', 'wDTotal', 'wDWins', 'greenBadgesTotal']

    getDefaultPlayer = function(playerUid) {
        return {
            jstPlayer: new jst.Player(playerUid),
            jstRating: defaultRating,
            ratings: _.reduce(ratingsList, function(result, key) { 
                result[key] = 0; 
                return result; 
            }, {})
        };
    },

    getPlayerWithRatings = function(playerUid, ratings) {
        return {
            jstPlayer: new jst.Player(playerUid),
            jstRating: new jst.Rating(ratings.tsMean, ratings.tsSd),
            ratings: _.reduce(ratingsList, function(result, key) { 
                result[key] = ratings[key]; 
                return result; 
            }, {})
        };
    };

exports.calculate = function(games, lastRatingsMap) {  
    var players = {},
        ratings = {},
        lastRatingsMap = lastRatingsMap || {},

        findPlayer = function(playerUid) {
            var player = players[playerUid];
            if (!player) {
                var lastPlayerRatings = lastRatingsMap[playerUid];
                players[playerUid] = player = 
                    lastPlayerRatings ? getPlayerWithRatings(playerUid, lastPlayerRatings) : getDefaultPlayer(playerUid);
            }
            return player;
        },

        addPlayer = function(team, playerUid) {
            var player = findPlayer(playerUid);
            team.addPlayer(player.jstPlayer, player.jstRating);
        },

        updateRatings = function(playerUid, position, playerScore) {
            players[playerUid].ratings[position + 'Total'] += 1;
            players[playerUid].ratings[position + 'Wins'] += playerScore == 10
            players[playerUid].ratings['greenBadgesTotal'] += playerScore == 0;
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
        _.forEach(ratingsMap, function(calculatedRating, playerUid) {
            calculatedRating.meanChange = calculatedRating.conservativeRating - players[playerUid].jstRating.conservativeRating;
            players[playerUid].jstRating = calculatedRating;
        });

        updateRatings(game.blueDefender, 'bD', game.blueScore);
        updateRatings(game.blueAttacker, 'bA', game.blueScore);
        updateRatings(game.whiteDefender, 'wD', game.whiteScore);
        updateRatings(game.whiteAttacker, 'wA', game.whiteScore);
    }    
    
    return _.map(players, function(player, playerUid) {
        return _.assign({
            playerUid: playerUid,
            tsMean: player.jstRating.mean,
            tsSd: player.jstRating.standardDeviation,
            tsMeanChange: player.jstRating.meanChange
        }, player.ratings);
    });
}

