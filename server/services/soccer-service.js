var Ratings = require('./ratings'),
    _ = require('lodash'),    
    db = require('./db-queries'),
    soccer = require('./soccer-manager'),
    playerConverter = require('./converters').playerConverter,
    gameConverter = require('./converters').gameConverter,
    Q = require('q');


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
        soccer.recalculateRatings()
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
        soccer.deleteGame(gameId)
        .then(db.findAllRatingsMap)
        .then(function(ratings) {
            res.send({ ratings : ratings});
        }).catch(errorHandler(res));
    });

	server.post('/api/games/add', function(req, res) {
		var game = req.body;
        soccer.addGame(game)
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
        soccer.addPlayer(player)
        .then(db.findPlayers)
        .then(function(players) {
            res.send({
                players: _.map(players, playerConverter())
            });
        }).catch(errorHandler(res));
    });

}

