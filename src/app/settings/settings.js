angular.module('views.settings', [
	'views.players',
	'data.dataSource',
	'controls.sortable',
	'controls.selectableList'
]).

controller('SettingsCtrl', function() {
	settings = {
		tab: {}
	}
});