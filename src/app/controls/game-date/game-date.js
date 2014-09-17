angular.module('control.gameDate', []).

directive('gameDate', function() {
	return {
		template: '<span class="game-date"><span class="date">{{date}}</span><span class="time">{{time}}</span></span>',
		scope: true,
		replace: true,
		link: function($scope, $element, $attrs) {
			$attrs.$observe('gameDate', function(gameDate) {
				var gameDateParts = gameDate.split('T');
				$scope.date = gameDateParts[0];
				$scope.time = gameDateParts[1];
			})
		}
	}
})