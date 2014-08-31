var Players = require('./players');
var Ratings = require('./ratings');
var db = require('./data-source');
var Q = require('q');
var myDb;

exports.init = function(server) {

    server.get('/api/init', function(req, res) {
        Q.all([db.findPlayers(), db.findGames()]).
        spread(function(players, games) {
            res.send({
                players: players,
                games: games
            })
        });
    });

    server.get('/api/recalculate', function(req, res) {
        db.findGames().then(function(games) {
            console.log('start');
            Ratings.calculate(games);
        });
        res.send({});
    });

	server.get('/api/init2', function(req, res) {
		retrieveStats(myDb, function(players, playersStats, playersRatings)  {
            Games.find(myDb, function(games) {
                var data = {
                    players: players,
                    stats: {
                        players: playersStats,
                        ratings : playersRatings
                    },
                    games: games
                };
                res.send(data);
            });
		});
	});

	server.post('/api/players/add', function(req, res) {
		var data = req.body; 
		var collection = myDb.collection('players'),
			lcName = data.name.toLowerCase();
		
		collection.update(
			{uid: lcName}, 
			{ $set: {
				name: data.name,
				uid: lcName
			} }, 
			{upsert: true, safe: true},
			function() {
				retrieveStats(myDb, function(players, playersStats, playersRatings) {
                    var data = {
                        players: players,
                        stats: {
                            players: playersStats,
                            ratings : playersRatings
                        }
                    };
                    res.send(data);
				});
			}
		);
	});

	server.post('/api/games/add', function(req, res) {
		var game = req.body; 		
        db.insertGame(game).then(function(game) {
            // get all userratings for the game of 4 users
            // calculate new ratings
            // return new ratings        
            res.send({
                game: game
            });
        });
		//var collection = myDb.collection('games');
        /*collection.insert(game,
            {safe: true},
            function(err, addedGames) {
                calculateStats(myDb, function() {
                    retrieveStats(myDb, function(players, playersStats, playersRatings) {
                        var data = {
                            stats: {
                                players: playersStats,
                                ratings : playersRatings
                            },
                            game: addedGames[0]
                        };
                       res.send(data)
                    });
                });

            }
		);*/	
	});
}

var calculateStats = function(db, callback ) {
    var playersCollection = myDb.collection('players'),
        gamesCollection = myDb.collection('games');
    Players.calculateStats(db, gamesCollection, function(errP) {
        Ratings.calculate(db, playersCollection, gamesCollection, function(errR) {
            errP && console.log(errP);
            errR && console.log(errR);
            console.log('Players aggregates regenerated ... ');
            callback && callback();
        });
    });
}

var retrieveStats = function(db, callback ) {
    var playersCollection = db.collection('players');
    Players.find(db, playersCollection, function(players, playersStats) {
        Ratings.find(db, playersCollection, function(playersRatings) {
            callback && callback(players, playersStats, playersRatings);
        });
    });
}
