var PlayersStats = require('./players-stats');

exports.find = function(db, callback) {
	db.collection('test_players').find().sort({name: 1}).toArray(function(err, players) {
		db.collection('test_players_stats').find().toArray(function(err, stats) {
			var statsMap = {};
			for(var i = 0; i < stats.length; i++) 
				statsMap[stats[i]._id] = stats[i].value;

			for(var i = 0; i < players.length; i++) {
				var stats = statsMap[players[i]._id];
				players[i].stats = stats ? stats : PlayersStats.emptyStats();
			}

			callback(players);
		});
	});
}