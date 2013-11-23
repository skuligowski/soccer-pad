var ipsum = require('lorem-ipsum'),
	moment = require('moment');

var randInt = function(M, N) {
		return Math.floor(M + (1+N-M)*Math.random());
	},

	randAmount = function(M, N) {
		var amount = M + (N - M) * Math.random()
		return amount.toFixed(2) * 1;
	},

	randTimestamp = function(monthsBack) {
		var date = new Date()
			daysBack = monthsBack * 30;
		date.setHours(-24 * randInt(0, daysBack));
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return Math.round(date.getTime());
	};

exports.ipsum = ipsum;
exports.int = randInt;
exports.amount = randAmount;
exports.timestamp = randTimestamp;
exports.moment = moment;