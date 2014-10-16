angular.module('controls.tabs', []).

directive('tabs', function() {
	return {
		restrict: 'A',
		scope: {
			value: "=tabs"
		},
		controller: ['$scope',
			function($scope) {
				var panes = [];
				this.select = select;
				this.register = register;

				function select(pane, event) {
					if (event) {
						event.stopPropagation();
						event.preventDefault();
					}
					$scope.value = pane.value;
				}

				function register(pane) {
					panes.push(pane);
					if (pane.selected)
						select(pane);
				}

				$scope.$watch('value', function(newValue) {
					angular.forEach(panes, function(pane) {
						if (angular.equals(pane.value, newValue)) {
							pane.selected = true;
						} else {
							pane.selected = false;
						}
					});
				});
			}
		]
	};
}).

directive('pane', ['parseTabsPath',
	function(parseTabsPath) {
		return {
			require: '^tabs',
			restrict: 'A',
			transclude: true,
			scope: {},
			link: function(scope, element, attrs, ctrl) {
				scope.selected = attrs.selected;
				scope.value = parseTabsPath(attrs.pane);
				ctrl.register(scope);
				scope.select = ctrl.select;
			},
			replace: true,
			template: '<li ng-class="{active:selected}"><a href="#" ng-click="select(this, $event)" ng-transclude></a></li>'
		};
	}
]).

factory('parseTabsPath', function() {
	return function(path) {
		var route = null,
			query = null,
			queryIdx = path.indexOf('?');

		if (queryIdx == -1) 
			route = path; 
		else {
			route = path.substr(0, queryIdx);
			query = {};

			var queryStr = path.substr(queryIdx, path.length),
				paramRegex = /[?&](\w+)=(\w+)/g,
				match;
				
			while (match = paramRegex.exec(queryStr))			
				if (match != null && match.length == 3 && match[2] != null)
					query[match[1]] = match[2];
		}

		return {
			route: route,
			query: query
		};
	};
});