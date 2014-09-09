angular.module('filter.disabledPlayer', []).

filter('disabledPlayerFilter', function() {
	return function(players) {
		if (!players || !players.length)
			return players;

		var output = [];
		for(var i = 0; i < players.length; i++)
			if (!players[i].disabled)
				output.push(players[i]);
		return output;
	}
})