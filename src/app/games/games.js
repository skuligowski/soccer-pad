angular.module('views.games', ['controls.pager']).

controller('GamesCtrl', ['$scope', 'dataSource', function($scope, dataSource) {
	$scope.deleteGame = function(gameId) {
		dataSource.deleteGame(gameId);
	}
}]);