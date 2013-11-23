angular.module('data.dataSource', []).

factory('dataSource', ['$http', '$rootScope', function($http, $rootScope) {
	var model = { 
		players: []
	};
	$rootScope.model = model;

	$http.get('/players').success(function(data) {
		model.players = data;
	});
}]);