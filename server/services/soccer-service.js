var Players = require('./players'),
    Ratings = require('./ratings'),
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

    
    server.get('/api/ratings/recalculate', function(req, res) {
        db.begin(function(db) {
            Q.all([db.findAllRatingPeriods(), db.findGames('ASC'), db.clearRatings()]).
            spread(function(periods, games) {
                var replaceActions = [];
                for(var i = 0; i < periods.length; i++) {
                    var periodUid = periods[i],
                        newRatings = Ratings.calculate(games);
                    replaceActions.push(db.replacePlayersRatings(periodUid, newRatings));
                }
                return Q.all(replaceActions);
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
                }).then(function(ratings) {
                    res.send({
                        game: game
                    });
                    db.commit();
                }).catch(function(err) {
                    console.log(err)
                });
            });
        });
	});
}

