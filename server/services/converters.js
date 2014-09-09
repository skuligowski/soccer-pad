exports.playerConverter = function(player) {
    player.disabled = player.status === 'D';
    return player;
}