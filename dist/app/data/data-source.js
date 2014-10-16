angular.module('data.dataSource', []).

factory('dataSource', ['$http', '$rootScope', function($http, $rootScope) {
	var model = { 
		players: [],
		playersMapping: {},
		games: [],
		ratings: {},
		periods: []
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
		model.periods = data.periods;
	});

	return {
		addPlayer: function(name) {
			$http.post('/api/players/add', {name: name}).success(function(data) {
				model.players = data.players;
				model.playersMapping = createPlayersMapping(data.players);
			});
		},
		disablePlayer: function(playerUid) {
			$http.post('/api/players/disable', {uid: playerUid}).success(function(data) {
				model.playersMapping[playerUid].disabled = true;
				model.players = [].concat(model.players);
			});
		},
		activatePlayer: function(playerUid) {
			$http.post('/api/players/activate', {uid: playerUid}).success(function(data) {
				model.playersMapping[playerUid].disabled = false;
				model.players = [].concat(model.players);
			});
		},
		addGame: function(game) {
			$http.post('/api/games/add', game).success(function(data) {
				model.games.splice(0, 0, data.game);
				model.games = model.games.concat([]);
				model.ratings = data.ratings;
				model.periods = data.periods;
			});
		},
		deleteGame: function(gameId) {
			$http.post('/api/games/delete/' + gameId).success(function(data) {
				for(var i = 0; i < model.games.length; i++) {
					if (model.games[i].id === gameId)
						model.games.splice(i, 1);
				}
				model.games = [].concat(model.games);
				model.ratings = data.ratings;
			});
		},
		recalculateRatings: function() {
			$http.post('/api/ratings/recalculate').success(function(data) {
				model.ratings = data.ratings;
				model.periods = data.periods;
			});			
		}
	}
}]);