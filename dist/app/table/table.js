angular.module('views.table', [
	'data.dataSource', 
	'controls.playerSelector',
	'controls.tabs',
	'filter.disabledPlayer'
]).

controller('TableCtrl', ['$scope', 'dataSource', '$filter', function($scope, dataSource, $filter) {

	$scope.$watch('model.players', function(players) {
		$scope.players = $filter('disabledPlayerFilter')($scope.model.players);
	});

	var watchPosition = function(currentPlayer, position) {
		$scope.$watch('table.'+position, function(newPlayer, oldPlayer) {
			if (!newPlayer) return;
			
			angular.forEach($scope.table, function(player, index) {
				if (index == position) return;

				if (player && player.uid == newPlayer.uid)
					$scope.table[index] = null;
			});
		});
	};

	$scope.isSaveDisabled = function() {
		
		for(var position in $scope.table)
			if ($scope.table.hasOwnProperty(position) && !$scope.table[position])
				return true;

		var whiteScore = parseInt($scope.score.white),
			blueScore = parseInt($scope.score.blue);

		if (whiteScore < 0 || whiteScore > 10)
			return true;

		if (blueScore < 0 || blueScore > 10)
			return true;

		if (whiteScore == 10 && blueScore == 10)
			return true;
		
		if (whiteScore != 10 && blueScore != 10)
			return true;

		return false;
	};

	$scope.save = function() {
		var game = {
			whiteDefender: $scope.table.whiteDefender.uid,
			whiteAttacker: $scope.table.whiteAttacker.uid,
			blueDefender: $scope.table.blueDefender.uid,
			blueAttacker: $scope.table.blueAttacker.uid,
			whiteScore: parseInt($scope.score.white),
			blueScore: parseInt($scope.score.blue)
		};
		dataSource.addGame(game);
		$scope.app.tab = {
			route: 'games',
			query: null
		};
	};

	angular.forEach($scope.table, watchPosition);
}]);

