angular.module('data.dataSource', []).

factory('dataSource', ['$http', '$rootScope', function($http, $rootScope) {
	var model = { 
		players: [],
		playersMapping: {},
		games: []
	};
	var stats = {
		players: {}
	};
	$rootScope.model = model;
	$rootScope.stats = stats;

	var createPlayersMapping = function(players) {
		var mapping = {};
		for(var i = 0; i < players.length; i++)
			mapping[players[i]._id] = players[i];
		return mapping;
	};

	$http.get('/api/init').success(function(data) {
		model.players = data.players;
		model.playersMapping = createPlayersMapping(data.players);
		model.games = data.games;
		stats.players = data.stats.players;
	});

	return {
		addPlayer: function(name) {
			$http.post('/api/players/add', {name: name}).success(function(data) {
				model.players = data.players;
				model.playersMapping = createPlayersMapping(data.players);
				stats.players = data.stats.players;
			});
		},
		addGame: function(game) {
			$http.post('/api/games/add', game).success(function(data) {
				stats.players = data.stats.players;
				model.games.splice(0, 0, data.game);
			});
		} 
	}
}]);