angular.module('controls.selectableList', []).

directive('selectableList', function() {
	return {
		controller: ['$scope', '$attrs', function($scope, $attrs) {
			this.setValue = function(val) {
				$scope[$attrs.selectableList] = val;
			}
		}]
	};
}).

directive('listItem', function() {
	return {
		require: '^selectableList',
		link: function($scope, $element, $attrs, $ctrl) {
			$element.bind('click', function() {
				$ctrl.setValue($attrs.listItem);
				$scope.$apply();
			});
		}
	}
})