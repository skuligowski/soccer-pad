angular.module('controls.pager', []).

factory('pageRange', function() {
	return function(currentPage, firstPage, lastPage, visiblePagesCount) {
		var startButton = currentPage - Math.floor(visiblePagesCount / 2);
		startButton = startButton < firstPage ? firstPage : startButton;
		var endButton = startButton + visiblePagesCount - 1;
		endButton = endButton > lastPage ? lastPage : endButton;
		startButton = endButton - visiblePagesCount + 1;
		startButton = startButton < firstPage ? firstPage : startButton;
		
		return {
			startButton: startButton,
			endButton: endButton
		};
	}
}).

directive('pager', ['pageRange', function(pageRange) {
	return {
		restrict: 'A',
		scope: {
			source: '=',
			out: '='
		},
		replace: true,
		templateUrl: 'pager',
		link: function(scope, element, attrs) {
			var page = 1,
				pageSize = parseInt(attrs.pageSize) || 10,
				lastPage = 1,
				buttons = parseInt(attrs.buttons) || 5,
				pageButtons = [],
				
				next = function() {
					if (page != lastPage)
						goTo(page + 1);
				},
				prev = function() {
					if (page != 1)
						goTo(page - 1);
				},
				last = function() {
					if (page != lastPage)
						goTo(lastPage);
				},
				first = function() {
					if (page != 1) 
						goTo(1);
				},
				isLast = function() {
					return page == lastPage;
				},
				isFirst = function() {
					return page == 1;
				},
				isCurrent = function(aPage) {
					return page == aPage; 
				},
				goTo = function(newPage) {
					page = newPage;
					refresh();
				},
				count = function() {
					return lastPage;
				},
				refreshPageButtons = function() {
					var range = pageRange(page, 1, lastPage, buttons),
						startButton = range.startButton,
						endButton = range.endButton;

					pageButtons.length = 0;
					for (var i = startButton; i <= endButton; i++) {
						pageButtons.push({page: i});
					}
				},
				refresh = function() {

					var items = scope.source;
					
					lastPage = Math.ceil(items.length / pageSize) || 1;

					if (page > lastPage)
						page = lastPage;
					
					refreshPageButtons();

					var start = (page - 1) * pageSize,
						stop = (start + pageSize > items.length) ? items.length : start + pageSize,
						out = [];

					scope.out.length = 0;
					for(var i=start; i < stop; i++)
						scope.out.push(items[i]);
				};

			scope.out = [];
			scope.next = next;
			scope.prev = prev;
			scope.last = last;
			scope.first = first;
			scope.isLast = isLast;
			scope.isFirst = isFirst;
			scope.isCurrent = isCurrent;
			scope.goTo = goTo;
			scope.pageButtons = pageButtons;
			scope.count = count;
			
			scope.$watch('source', refresh);
		}
	}
}]);