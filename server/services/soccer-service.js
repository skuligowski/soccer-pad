var Ratings = require('./ratings'),
    _ = require('lodash'),    
    db = require('./db-queries'),
    playerConverter = require('./converters').playerConverter,
    gameConverter = require('./converters').gameConverter,
    Q = require('q');


var updateRatingsForPeriod = function(db, periodUid) {
        return db.findGamesForRatingPeriod(periodUid).then(function(games) {
            var newRatings = Ratings.calculate(games);
            return db.replacePlayersRatings(periodUid, newRatings);
        });           
    };

var updateRatingsForPeriods = function(db, periods) {
        var updateActions = [];
        for(var i = 0; i < periods.length; i++)
            updateActions.push(updateRatingsForPeriod(db, periods[i].uid));
        return Q.all(updateActions);
    };

var recalculateRatings = function() {
    return db.begin().then(function(db) {
        return db.clearRatings()
        .then(db.generateMonthlyPeriods)
        .then(db.findAllRatingPeriods)
        .then(function(periods) {
            return updateRatingsForPeriods(db, periods);
        }).then(db.commit);
    });
}

var addGame = function(game) {
    return db.begin().then(function(db) {
        return db.insertGame(game).then(function(game) {
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
        }).then(db.commit);
    });
}

var deleteGame = function(gameId) {
    return db.begin().then(function(db) {
        return db.findGame(gameId)
        .then(gameConverter())
        .then(function(game) {
            if (game.removable) {
                return db.removeGame(gameId).then(function() {
                    return db.findRatingPeriods(game.date);
                }).then(function(periods) {
                    return updateRatingsForPeriods(db, periods);
                }).then(db.commit);
            } else {
                return db.rollback().then(function() {
                    throw "Can't delete game. It's too late";
                });
            }
        });
    });
}

var errorHandler = function(res) {
    return function(err) {
        console.log(err);
        res.send(400);
    }
}

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
        }).catch(errorHandler(res));
    });

    server.post('/api/ratings/recalculate', function(req, res) {
        recalculateRatings()
        .then(function() {
            return Q.all([db.findAllRatingPeriods(), db.findAllRatingsMap()]);
        }).spread(function(periods, ratings) {
            res.send({
                periods: periods,
                ratings: ratings
            });
        }).catch(errorHandler(res));
    });

    server.post('/api/games/delete/:gameId', function(req, res) {
        var gameId = req.params.gameId;            
        deleteGame(gameId)
        .then(db.findAllRatingsMap)
        .then(function(ratings) {
            res.send({ ratings : ratings});
        }).catch(errorHandler(res));
    });

	server.post('/api/games/add', function(req, res) {
		var game = req.body;
        addGame(game)
        .then(function() {
            return Q.all([db.findAllRatingPeriods(), db.findAllRatingsMap()]);
        }).spread(function(periods, ratings) {
            res.send({
                game: gameConverter()(game),
                ratings: ratings,
                periods: periods
            });
        }).catch(errorHandler(res));
	});

    server.post('/api/players/disable', function(req, res) {
        var player = req.body;
        db.setPlayerStatus(player.uid, 'D').then(function() {
            res.send({});
        }).catch(errorHandler(res));
    });

    server.post('/api/players/activate', function(req, res) {
        var player = req.body;
        db.setPlayerStatus(player.uid, 'A').then(function() {
            res.send({});
        }).catch(errorHandler(res));
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
        }).catch(errorHandler(res));
    });

}

