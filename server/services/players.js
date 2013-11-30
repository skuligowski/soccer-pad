var mapFunction = function() {
	var whiteWin = this.score.white > this.score.blue;
	for(var position in this.table) {
		var whitePosition = position == 'A' | position == 'B',
			o = {
				games: 1,
				win: whitePosition ^ whiteWin ? 0 : 1,
				loss: whitePosition ^ whiteWin ? 1 : 0,
				winA: position == 'A' & whiteWin ? 1 : 0,
				winB: position == 'B' & whiteWin ? 1 : 0,
				winC: position == 'C' & !whiteWin ? 1 : 0,
				winD: position == 'D' & !whiteWin ? 1 : 0,
				lossA: position == 'A' & !whiteWin ? 1 : 0,
				lossB: position == 'B' & !whiteWin ? 1 : 0,
				lossC: position == 'C' & whiteWin ? 1 : 0,
				lossD: position == 'D' & whiteWin ? 1 : 0
			};
		emit(this.table[position], o);
	}
},

reduceFunction = function(user_id, stats) {
	var o = {
		games: 0,
		win: 0,
		loss: 0,
		winA: 0,
		winB: 0,
		winC: 0,
		winD: 0,
		lossA: 0,
		lossB: 0,
		lossC: 0,
		lossD: 0
	};
	for (var i = 0; i < stats.length; i++)
		for(var p in o)
			o[p] += stats[i][p];

	return o;
};

exports.calculateStats = function(db, gamesCollection, callback) {
	db.collection('players_stats').drop();
	gamesCollection.mapReduce(
		mapFunction,
		reduceFunction,
		{ out: "players_stats" },
		callback);
}


exports.find = function(db, callback) {
	db.collection('players').find().sort({'name': 1}).toArray(function(err, players) {
		db.collection('players_stats').find().toArray(function(err, stats) {
			var statsMap = {};
			for(var i = 0; i < stats.length; i++) 
				statsMap[stats[i]._id] = stats[i].value;

			for(var i = 0; i < players.length; i++) {
				var stats = statsMap[players[i]._id];
				if (!stats)
					statsMap[players[i]._id] = reduceFunction(players[i]._id, []);
			}
            callback(  players, statsMap);

		});
	});
}

