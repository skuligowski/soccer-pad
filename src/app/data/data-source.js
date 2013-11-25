angular.module('data.dataSource', []).

factory('dataSource', ['$http', '$rootScope', function($http, $rootScope) {
	var model = { 
		players: [],
		stats: {}
	};
	$rootScope.model = model;

	$http.get('/api/players').success(function(data) {
		model.players = data.players;
		model.stats = data.stats;
	});

	return {
		addPlayer: function(name) {
			$http.post('/api/players/add', {name: name}).success(function(data) {
				model.players = data.players;
				model.stats = data.stats;
			});
		},
		addGame: function(game) {
			$http.post('/api/games/add', game).success(function(data) {
				model.stats = data.stats;
			});
		} 
	}
}]);