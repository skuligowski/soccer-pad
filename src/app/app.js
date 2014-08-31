angular.module('myApp', [
	'ngAnimate',
	'views.table',
	'views.players',
	'views.games'
]).

controller('AppCtrl', ['$scope', function($scope) {
	$scope.table = {
		whiteDefender: null, 
		whiteAttacker: null, 
		blueDefender: null,
		blueAttacker: null 
	};
	$scope.score = {white: 10, blue: 10};
	$scope.playerSort = {
		column: 'mean',
		descending: true
	};
}]);

