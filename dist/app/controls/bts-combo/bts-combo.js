angular.module('controls.btsCombo', []).

factory('btsDropdown', [function() {
	var create = function(dropdown, defaultLabel) {
		var toggleButton = $('.dropdown-toggle', dropdown),
			toggleLabel = $('.dropdown-label', toggleButton),

			onKeyDown = function(e) {
				if (!/(38|40|27)/.test(e.keyCode)) 
					return;
				
				e.preventDefault();
				e.stopPropagation();

				var isActive = dropdown.hasClass('open');
				if (!isActive || (isActive && e.keyCode == 27)) {
					if (e.which == 27) toggleButton.focus();
					return $(this).click();
				}

				var items = $('[role=menu] li:not(.divider):visible a', dropdown);

				if (!items.length) return;

				var index = items.index(items.filter(':focus'));
				if (e.keyCode == 38 && index > 0) index--;
				if (e.keyCode == 40 && index < items.length - 1) index++;
				if (!~index) index = 0;

				items.eq(index).focus();
			},

			open = function(e) {
				if (toggleButton.hasClass('disabled')) return;

				var isOpened = dropdown.hasClass('open');
				clearMenus();
				
				if (!isOpened) {
					dropdown.addClass('open');
					toggleButton.addClass('active');
				}

				e.preventDefault();
				e.stopPropagation();

				toggleButton.focus();
			}, 

			toggleDisabled = function(isDisabled) {
				if (isDisabled) {
					toggleButton.addClass('disabled');
				} else { 
					toggleButton.removeClass('disabled');
				}
			};

		toggleButton.bind('click', open);
		toggleButton.bind('keydown', onKeyDown);
		$('.dropdown-menu', dropdown).bind('keydown', onKeyDown);

		return {
			setLabel: function(label) {
				toggleLabel.html(label);
			},
			setDefaultLabel: function() {
				toggleLabel.html(defaultLabel);
			},
			toggleDisabled: function(isDisabled) {
				toggleDisabled(isDisabled);
			}
		};
	},

	clearMenus = function() {
		$('.dropdown').removeClass('open');
		$('.dropdown-toggle').removeClass('active');
	};

	return {
		create: create,
		clearMenus: clearMenus
	};
}]).

directive('btsCombo', ['$document', 'btsDropdown', function($document, btsDropdown) {
	
	var arrayRemove = function(array, value) {
		var index = $.inArray(array, value);
		if (index > -1)
			array.splice(index, 1);
		return value;
	};

	$document.on('click.dropdown.data-api', btsDropdown.clearMenus);

	return {
		restrict: 'A',
		require: ['btsCombo', 'ngModel'],
		templateUrl: function (tElement, tAttrs) {
            if (tAttrs.template)
                return tAttrs.template;
            return 'btsCombo';
        },
		replace: true,
		transclude: true,
		controller: ['$scope', function($scope) {
			var options = [],
				ngModelCtrl = null,
				dropdown = null,

				renderOption = function(option) {
					if (!ngModelCtrl)
						return;

					var isActive = option.updateState(ngModelCtrl.$modelValue);
					
					if (isActive)
						dropdown.setLabel(option.getLabel());

					return isActive;
				},

				render = function() {
					var anyActive = false;

					for (var i = 0, max = options.length; i < max; i++) 
						anyActive |= renderOption(options[i]);

					if (!anyActive)
						dropdown.setDefaultLabel();
				};

			this.init = function(dropdownObj, ngModelController) {
				ngModelCtrl = ngModelController;
				ngModelCtrl.$render = render;
				dropdown = dropdownObj;
			};

			this.addOption = function(option) {
				options.push(option);
				renderOption(option);
			};

			this.selectOption = function(option) {
				btsDropdown.clearMenus();
				$scope.$apply(function() {
					ngModelCtrl.$setViewValue(option.getValue());
					ngModelCtrl.$render();
				});
			};

			this.removeOption = function(option) {
				arrayRemove(options, option);
				if (option.isActive)
					dropdown.setDefaultLabel();
			};

			this.toggleDisabled = function(isDisabled) {
				dropdown.toggleDisabled(isDisabled);
			}

		}],
		link: function($scope, $elem, $attrs, ctrl) {			
			var comboCtrl = ctrl[0],
				ngModelCtrl = ctrl[1],
				disabledAttr = $attrs.btsComboDisabled;

			comboCtrl.init(btsDropdown.create($elem, $attrs.toggleDefault), ngModelCtrl);

			if (disabledAttr) {
				$scope.$watch(disabledAttr, function(isDisabled){
					comboCtrl.toggleDisabled(isDisabled);
				});
			}
		}
	};
}]).

directive('btsComboItem', [function() {
	return {
		restrict: 'A',
		require: '^btsCombo',
		link: function($scope, $elem, $attrs, comboCtrl) {
			var option = {
				isActive: false,
				updateState: function(value) {
					var isActive = option.isActive = value === option.getValue();
					if (!isActive && $elem.hasClass('active'))
						$elem.removeClass('active');

					if (isActive && !$elem.hasClass('active'))
						$elem.addClass('active');

					return isActive;
				},
				getLabel: function() {
					return $scope.$eval($attrs.btsComboLabel);
				},
				getValue: function() {
					return $scope.$eval($attrs.btsComboItem);	
				}
			};

			comboCtrl.addOption(option);
			$elem.bind('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				comboCtrl.selectOption(option);
			});
			$elem.bind('$destroy', function() {
				comboCtrl.removeOption(option);
			});
		}
	};
}]);
