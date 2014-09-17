var Ratings = require('./ratings'),
    _ = require('lodash'),
    db = require('./data-source'),
    playerConverter = require('./converters').playerConverter,
    gameConverter = require('./converters').gameConverter,
    Q = require('q');

exports.init = function(server) {

    server.get('/api/init', function(req, res) {        
        Q.all([db.findPlayers(), db.findGames(20), db.findAllRatingPeriods(), db.findAllRatingsMap()]).
        spread(function(players, games, periods, ratings) {
            res.send({
                players: _.map(players, playerConverter()),
                games: _.map(games, gameConverter()),
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
    },

    updateRatingsForPeriods = function(db, periods) {
        var updateActions = [];
        for(var i = 0; i < periods.length; i++)
            updateActions.push(updateRatingsForPeriod(db, periods[i].uid));
        return Q.all(updateActions);
    };
    
    server.post('/api/ratings/recalculate', function(req, res) {
        db.begin(function(db) {
            var result = {};
            db.clearRatings().then(function() {
                return db.generateMonthlyPeriods();
            }).then(function() {
                return db.findAllRatingPeriods();
            }).then(function(periods) {
                result.periods = periods;
                return updateRatingsForPeriods(db, periods);
            }).then(function() {
                return db.findAllRatingsMap();
            }).then(function(ratings) {
                db.commit();
                result.ratings = ratings;
                res.send(result);
            });
        });
    });

    server.post('/api/games/delete/:gameId', function(req, res) {
        var gameId = req.params.gameId;
        db.begin(function(db) {
            db.findGame(gameId).then(gameConverter()).then(function(game) {
                if (game.removable) {
                    db.removeGame(gameId).then(function() {
                        return db.findRatingPeriods(game.date);
                    }).then(function(periods) {
                        return updateRatingsForPeriods(db, periods);
                    }).then(function() {
                        return db.findAllRatingsMap();
                    }).then(function(ratings) {
                        db.commit();
                        res.send({
                            ratings: ratings
                        });
                    });
                } else {
                    db.rollback();
                    res.send(400);
                }
            });
        });
    });

	server.post('/api/games/add', function(req, res) {
		var game = req.body;
        db.begin(function(db) {
            db.insertGame(game).then(function(game) {
                return db.createMonthlyPeriod(game.date);                
            }).then(function() {
                return db.findRatingPeriods(game.date);
            }).then(function(periods) {
                return db.findPlayersRatingsMap(_.map(periods, 'uid')).then(function(ratings) {
                    var replaceActions = [];
                    for(var i = 0; i < periods.length; i++) {                    
                        var periodUid = periods[i].uid,
                            newRatings = Ratings.calculate([game], ratings[periodUid]);
                        replaceActions.push(db.replacePlayersRatings(periodUid, newRatings));
                    }
                    return Q.all(replaceActions);
                });
            }).then(function() {
                return Q.all([db.findAllRatingPeriods(), db.findAllRatingsMap()]);
            }).spread(function(periods, ratings) {
                res.send({
                    game: gameConverter()(game),
                    ratings: ratings,
                    periods: periods
                });
                db.commit();
            });
        });
	});

    server.post('/api/players/disable', function(req, res) {
        var player = req.body;
        db.setPlayerStatus(player.uid, 'D').then(function() {
            res.send({});
        });
    });

    server.post('/api/players/activate', function(req, res) {
        var player = req.body;
        db.setPlayerStatus(player.uid, 'A').then(function() {
            res.send({});
        });
    });

    server.post('/api/players/add', function(req, res) {
        var player = req.body;
        db.addPlayer({
            uid: player.name.toLowerCase().replace(/ /, ""),
            name: player.name,
            status: 'A'
        }).then(function() {
            return db.findPlayers();
        }).then(function(players) {
            res.send({
                players: _.map(players, playerConverter())
            });
        }).catch(function(err) {
            res.send(400);
        });
    });

}

