angular.module('controls.sortable', []).

directive('sortable', [ function() {

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
        transclude : true,

        templateUrl: 'sortable',

        link: function(scope, elem, attrs) {
            isSorted = function() {
                return scope.column == scope.sort.column;
            },
            isDesc = function() {
                return scope.sort.descending;
            },
            elem.bind('click', function(e) {
                changeSorting(scope.sort,   scope.column)
                scope.$apply();
			});
            scope.isSorted = isSorted;
            scope.isDesc = isDesc;

        }


    };


}]);





