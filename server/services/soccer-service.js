var MongoClient = require('mongodb').MongoClient;
var Players = require('./players');
var Games = require('./games');
var Ratings = require('./ratings');
var myDb;

var connect = function() {
    MongoClient.connect('mongodb://127.0.0.1:27017/soccer-pad', function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        myDb = db;

        calculateStats(myDb);
    });
}

connect();

exports.init = function(server) {

	server.get('/api/init', function(req, res) {
		retrieveStats(myDb, function(players, playersStats, playerRatings)  {
            Games.find(myDb, function(games) {
                var data = {
                    players: players,
                    stats: {
                        players: playersStats,
                        ratings : playerRatings
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
				retrieveStats(myDb, function(players, playersStats, playerRatings) {
                    var data = {
                        players: players,
                        stats: {
                            players: playersStats,
                            ratings : playerRatings
                        }
                    };
                    res.send(data);
				});
			}
		);
	});

	server.post('/api/games/add', function(req, res) {
		var game = req.body; 
		game.date = new Date();
		var collection = myDb.collection('games');
        collection.insert(game,
            {safe: true},
            function(err, addedGames) {
                calculateStats(myDb, function() {
                    retrieveStats(myDb, function(players, playersStats, playerRatings) {
                        var data = {
                            stats: {
                                players: playersStats,
                                ratings : playerRatings
                            },
                            game: addedGames[0]
                        };
                       res.send(data)
                    });
                });

            }
		);	
	});
}

var calculateStats = function(db,   callback ) {
    var playersCollection = myDb.collection('players')
      , gamesCollection = myDb.collection('games');
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
    Players.find(db, function(players, playersStats) {
        Ratings.find(db, function(playerRatings) {
            callback && callback(players, playersStats, playerRatings);
        });
    });
}
