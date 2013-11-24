angular.module('myApp', [
	'ngAnimate',
	'views.table',
	'views.players'
]).

controller('AppCtrl', ['$scope', function($scope) {
	$scope.table = {A: null, B: null, C: null, D: null};
	$scope.score = {white: 10, blue: 10};
}]);

