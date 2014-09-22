var zpad = function(value) {
 return ('0' + value).slice(-2);
}

Date.prototype.toISOString = function() {
	return this.getFullYear() + '-' + zpad(this.getMonth() + 1) + '-' + zpad(this.getDate()) + 'T' + zpad(this.getHours()) + ':' + zpad(this.getMinutes());
}

exports.playerConverter = function() {
	return function(player) {
    	player.disabled = player.status === 'D';
    	return player;
    }
}

exports.gameConverter = function() {
	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	
	var todayTime = today.getTime(),	
		removableTime = new Date().getTime() - 5*60*1000; // 5 minutes removable time
	
	return function(game) {
		var gameDateTime = game.date.getTime();
		game.removable = gameDateTime > removableTime;
		game.today = gameDateTime > todayTime;
		return game;
	}
}

