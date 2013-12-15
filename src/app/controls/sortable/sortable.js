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

            scope.$watch('sort', function() {
                scope.isSorted = scope.column == scope.sort.column;
                scope.isAsc = scope.sort.descending;
            }, true);

            elem.bind('click', function(e) {
                changeSorting(scope.sort,   scope.column)
                scope.$apply();
			});

        }
   };
}]);





