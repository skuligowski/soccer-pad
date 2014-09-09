angular.module('views.settings.players', ['data.dataSource','controls.sortable']).

controller('PlayersCtrl', ['$scope', 'dataSource', function($scope, dataSource) {

	$scope.addPlayer = function() {
		dataSource.addPlayer($scope.playerName);
	}

	$scope.disablePlayer = function(playerUid) {
		dataSource.disablePlayer(playerUid);
	}

	$scope.activatePlayer = function(playerUid) {
		dataSource.activatePlayer(playerUid);
	}
}]);





