angular.module('data.dataSource', []).

factory('dataSource', ['$http', '$rootScope', function($http, $rootScope) {
	var model = { 
		players: [],
		games: []
	};
	var stats = {
		players: {}
	};
	$rootScope.model = model;
	$rootScope.stats = stats;

	$http.get('/api/init').success(function(data) {
		model.players = data.players;
		model.games = data.games;
		stats.players = data.stats.players;
	});

	return {
		addPlayer: function(name) {
			$http.post('/api/players/add', {name: name}).success(function(data) {
				model.players = data.players;
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