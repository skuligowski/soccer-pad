angular.module('data.dataSource', []).

factory('dataSource', ['$http', '$rootScope', function($http, $rootScope) {
	var model = { 
		players: []
	};
	$rootScope.model = model;

	$http.get('/api/players').success(function(data) {
		model.players = data;
	});

	return {
		addPlayer: function(name) {
			$http.post('/api/players/add', {name: name}).success(function(data) {
				model.players = data;
			});
		},
		addGame: function(game) {
			$http.post('/api/games/add', game).success(function(data) {
				model.players = data;
			});
		} 
	}
}]);