angular.module('views.players', ['data.dataSource','controls.sortable']).

controller('PlayersCtrl', ['$scope', 'dataSource', function($scope, dataSource) {

	$scope.addPlayer = function() {
		dataSource.addPlayer($scope.playerName);
	}

}]);





