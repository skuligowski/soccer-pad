angular.module('controls.sortable', []).

directive('sortable', [ '$document',function($document) {

    var changeSorting = function(sortable,column) {
        if (sortable.column == column) {
            sortable.descending = !sortable.descending;
        } else {
            sortable.column = column;
            sortable.descending = true;
        }
    };
    return {
        restrict: 'A',
		scope: {
            sort: '=sortable',
			column: '@'
		},

        link: function(scope, elem, attrs) {
            elem.bind('click', function(e) {
                changeSorting(scope.sort,   scope.column)
                scope.$apply();
			});

        }
    };


}]);





