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

            var isUnsorted = function() {
                return scope.column != scope.sort.column;
            },

            isAsc = function() {
                return scope.column == scope.sort.column && !scope.sort.descending;
            },

            isDesc = function() {
                return scope.column == scope.sort.column && scope.sort.descending;
            },

            getImage = function() {
                if (isUnsorted()) return 'img/minus.jpg';
                if (isDesc()) return 'img/sortup.jpg';
                if (isAsc()) return 'img/sortdown.jpg';
            };
            elem.bind('click', function(e) {
                changeSorting(scope.sort,   scope.column)
                scope.$apply();
			});
            scope.isUnsorted=isUnsorted;
            scope.isAsc = isAsc;
            scope.isDesc = isDesc;
            scope.getImage = getImage;

        }


    };


}]);





