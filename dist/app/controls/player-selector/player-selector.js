angular.module('controls.playerSelector', ['controls.btsCombo']).

directive('playerSelector', function() {
	return {
		restrict: 'A',
		templateUrl: 'playerSelector',
		scope: {
			players: '=',
			position: '@',
			selectedPlayer: '=playerSelector'
		},
		link: function($scope, $element) {

		}
	}
});