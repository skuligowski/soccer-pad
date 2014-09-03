var Players = require('./players');
var Ratings = require('./ratings');
var ds = require('./data-source');
var Q = require('q');
var myDb;

exports.init = function(server) {

    server.get('/api/init', function(req, res) {        
        ds.conn(function(db) {
            Q.all([db.findPlayers(), db.findGames()]).
            spread(function(players, games) {
                res.send({
                    players: players,
                    games: games
                });
                db.close();
            });            
        })
        
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
        ds.begin(function(db) {
            db.insertGame(game).then(function(game) {
                return db.findRatingPeriods(game.date);
            }).then(function(periods) {
                db.findPlayersRatingsMap(periods).then(function(ratings) {
                    for(var i = 0; i < periods.length; i++) {                    
                        var periodUid = periods[i],
                            newRatings = Ratings.calculate([game], ratings[periodUid]);
                        db.replacePlayersRatings(periodUid, newRatings);
                    }
                }).then(function(ratings) {
                    res.send({
                        game: game
                    });
                    db.commit();
                });
            })
        })

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
