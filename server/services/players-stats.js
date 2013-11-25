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

exports.calculate = function(db, callback) {
	db.collection('test_players_stats').drop();
	db.collection('test_games').mapReduce(
		mapFunction,
		reduceFunction,
		{ out: "test_players_stats" },
		callback);
}

exports.emptyStats = function() {
	return {
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
}