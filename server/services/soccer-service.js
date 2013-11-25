var MongoClient = require('mongodb').MongoClient;
var Players = require('./players');
var Games = require('./games');
var myDb;

var connect = function() {
	MongoClient.connect('mongodb://127.0.0.1:27017/soccer-pad', function(err, db) {

      if(err) { 
      	console.log(err);
      	return;	
      };
      myDb = db;
      var players = myDb.collection('players');
      var games = myDb.collection('games');
      Players.calculateStats(myDb, function(err) {
      	if (err) {
      		console.log(err);
      		return;
      	}
      	console.log('Players aggregates regenerated ... ');
      });
    });  
}

connect();

exports.init = function(server) {

	server.get('/api/init', function(req, res) {
		Players.find(myDb, function(players, playersStats) {
			Games.find(myDb, function(games) {
				var data = {
					players: players,
					stats: {
						players: playersStats
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
				Players.find(myDb, function(players, playersStats) {
					var data = {
						players: players,
						stats: {
							players: playersStats
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
		console.log(game);
		collection.insert(game, 
			{safe: true},
			function(err, addedGames) {
				Players.calculateStats(myDb, function(err) {
					if (err)
						console.log(err);

					console.log('Players aggregates regenerated ... ');
					Players.find(myDb, function(players, playersStats) {
						var data = {
							stats: {
								players: playersStats
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


