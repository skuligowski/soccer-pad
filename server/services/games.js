exports.find = function(db, callback) {
	db.collection('games').find().sort({'date': -1}).toArray(function(err, gamesArray) {
		callback(gamesArray);
	});
}