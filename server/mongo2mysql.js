var dataSource = require('./services/data-source'),
	db = dataSource(function(query) {
		return {
			findGames: function() {
				return query('DELETE FROM games');
			}
		};
	});
	
console.log(db);
db.findGames().then(function() {
	console.log('deleted');
	return null;
}).then(db.destroy).catch(function(a) {
	console.log('a')
});

/*db.findGames().then(function(games) {
	return db2.findPlayers();
}).then(function(players) {
	console.log(players);
	return players;
}).then(dataSource.destroy);*/