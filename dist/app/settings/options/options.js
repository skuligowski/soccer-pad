angular.module('views.settings.options', []).

controller('OptionsCtrl', ['$scope', 'dataSource', function($scope, dataSource) {

	$scope.recalculate = dataSource.recalculateRatings;
	
}]);





