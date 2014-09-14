var zpad = function(value) {
 return ('0' + value).slice(-2);
}

Date.prototype.toISOString = function() {
	return this.getFullYear() + '-' + zpad(this.getMonth()) + '-' + zpad(this.getDate()) + 'T' + zpad(this.getHours()) + ':' + zpad(this.getMinutes()) + ':' + zpad(this.getSeconds());
}

exports.playerConverter = function() {
	return function(player) {
    	player.disabled = player.status === 'D';
    	return player;
    }
}

exports.gameConverter = function() {
	var currentDate = new Date().getTime() - 51*60*1000; // 5 minutes removable time
	return function(game) {
		game.removable = game.date.getTime() > currentDate;
		return game;
	}
}

