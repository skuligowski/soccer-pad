angular.module('data.dataSource', []).

factory('dataSource', ['$http', '$rootScope', function($http, $rootScope) {
	var model = { 
		players: [],
		playersMapping: {},
		games: [],
		ratings: {}
	};
	var ratings = {};
	$rootScope.model = model;

	var createPlayersMapping = function(players) {
		var mapping = {};
		for(var i = 0; i < players.length; i++)
			mapping[players[i].uid] = players[i];
		return mapping;
	};

	$http.get('/api/init').success(function(data) {
		model.players = data.players;
		model.playersMapping = createPlayersMapping(data.players);
		model.games = data.games;
		model.ratings = data.ratings;
	});

	return {
		addPlayer: function(name) {
			$http.post('/api/players/add', {name: name}).success(function(data) {
				model.players = data.players;
				model.playersMapping = createPlayersMapping(data.players);
				stats.players = data.stats.players;
                stats.ratings = data.stats.ratings;
			});
		},
		addGame: function(game) {
			$http.post('/api/games/add', game).success(function(data) {
			    //stats.players = data.stats.players;
                //stats.ratings = data.stats.ratings;
				//data.game.new = true;
				model.games.splice(0, 0, data.game);
				model.games = model.games.concat([]);
			});
		} 
	}
}]);