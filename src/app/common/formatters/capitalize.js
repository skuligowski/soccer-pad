angular.module('formatters.capitalize', []).

filter('capitalize', function() {
	return function(text) {
		return text.replace(/(?:^|\s)\S/g, function(part) { 
			return part.toUpperCase(); 
		});		
	}
});