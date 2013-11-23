angular.module('myApp', [
	'data.dataSource', 
	'controls.playerSelector'
]).

controller('AppCtrl', ['$scope', 'dataSource', function($scope, dataSource) {
	$scope.table = {A: null, B: null, C: null, D: null};
	$scope.score = {white: 10, blue: 10};

	var watchPosition = function(currentPlayer, position) {
		$scope.$watch('table.'+position, function(newPlayer, oldPlayer) {
			if (!newPlayer) return;
			
			angular.forEach($scope.table, function(player, index) {
				if (index == position) return;

				if (player && player._id == newPlayer._id)
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

		if (whiteScore == 10 && whiteScore == 10)
			return true;
		
		if (whiteScore != 10 && blueScore != 10)
			return true;

		return false;
	};

	$scope.save = function() {
		var game = {
			table: {
				A: $scope.table.A._id,
				B: $scope.table.B._id,
				C: $scope.table.C._id,
				D: $scope.table.D._id
			},
			score: $scope.score
		};
		console.log(game);
	};

	angular.forEach($scope.table, watchPosition);

}]);

