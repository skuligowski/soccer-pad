angular.module('views.settings', [
	'views.settings.players',
	'views.settings.options',
	'data.dataSource',
	'controls.sortable',
	'controls.selectableList'
]).

controller('SettingsCtrl', function() {
	settings = {
		tab: {}
	}
});