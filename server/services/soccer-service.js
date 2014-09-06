var Ratings = require('./ratings'),
    db = require('./data-source'),
    Q = require('q');

exports.init = function(server) {

    server.get('/api/init', function(req, res) {        
        Q.all([db.findPlayers(), db.findGames(), db.findAllRatingPeriods(), db.findAllRatingsMap()]).
        spread(function(players, games, periods, ratings) {
            res.send({
                players: players,
                games: games,
                periods: periods,
                ratings: ratings
            });
        });
    });

    var updateRatingsForPeriod = function(db, periodUid) {
        return db.findGamesForRatingPeriod(periodUid).then(function(games) {
            var newRatings = Ratings.calculate(games);
            return db.replacePlayersRatings(periodUid, newRatings);
        });           
    }
    
    server.get('/api/ratings/recalculate', function(req, res) {
        db.begin(function(db) {
            Q.all([db.findAllRatingPeriods(), db.clearRatings()]).
            spread(function(periods) {
                var updateActions = [];
                for(var i = 0; i < periods.length; i++)
                    updateActions.push(updateRatingsForPeriod(db, periods[i].uid));
                return Q.all(updateActions);
            }).then(function() {
                db.commit();
                res.send({});
            });
        });

    });

	server.post('/api/games/add', function(req, res) {
		var game = req.body;
        db.begin(function(db) {
            db.insertGame(game).then(function(game) {
                return db.findRatingPeriods(game.date);
            }).then(function(periods) {
                db.findPlayersRatingsMap(periods).then(function(ratings) {
                    var replaceActions = [];
                    for(var i = 0; i < periods.length; i++) {                    
                        var periodUid = periods[i],
                            newRatings = Ratings.calculate([game], ratings[periodUid]);
                        replaceActions.push(db.replacePlayersRatings(periodUid, newRatings));
                    }
                    return Q.all(replaceActions);
                }).then(function() {
                    return db.findAllRatingsMap();                    
                }).then(function(ratings) {
                    res.send({
                        game: game,
                        ratings: ratings
                    });
                    db.commit();
                });
            });
        });
	});
}

