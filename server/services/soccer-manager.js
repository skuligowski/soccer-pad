var Ratings = require('./ratings'),
    _ = require('lodash'),    
    db = require('./db-queries'),
    gameConverter = require('./converters').gameConverter,
    Q = require('q');

var updateRatingsForPeriod = function(db, periodUid) {
        return db.findGamesForRatingPeriod(periodUid).then(function(games) {
            var newRatings = Ratings.calculate(games);
            return db.replacePlayersRatings(periodUid, newRatings);
        });           
    };

var updateRatingsForPeriods = function(db, periods) {
        var updateActions = [];
        for(var i = 0; i < periods.length; i++)
            updateActions.push(updateRatingsForPeriod(db, periods[i].uid));
        return Q.all(updateActions);
    };

exports.recalculateRatings = function() {
    return db.begin().then(function(db) {
        return db.clearRatings()
        .then(db.generateMonthlyPeriods)
        .then(db.findAllRatingPeriods)
        .then(function(periods) {
            return updateRatingsForPeriods(db, periods);
        }).then(db.commit);
    });
}

exports.addGame = function(game) {
    return db.begin().then(function(db) {
        return db.insertGame(game).then(function(game) {
            return db.createMonthlyPeriod(game.date);                
        }).then(function() {
            return db.findRatingPeriods(game.date);
        }).then(function(periods) {
            return db.findPlayersRatingsMap(_.map(periods, 'uid')).then(function(ratings) {
                var replaceActions = [];
                for(var i = 0; i < periods.length; i++) {
                    var periodUid = periods[i].uid,
                        newRatings = Ratings.calculate([game], ratings[periodUid]);
                    replaceActions.push(db.replacePlayersRatings(periodUid, newRatings));
                }
                return Q.all(replaceActions);
            });
        }).then(db.commit);
    });
}

exports.deleteGame = function(gameId) {
    return db.begin().then(function(db) {
        return db.findGame(gameId)
        .then(gameConverter())
        .then(function(game) {
            if (game.removable) {
                return db.removeGame(gameId).then(function() {
                    return db.findRatingPeriods(game.date);
                }).then(function(periods) {
                    return updateRatingsForPeriods(db, periods);
                }).then(db.commit);
            } else {
                return db.rollback().then(function() {
                    throw "Can't delete game. It's too late";
                });
            }
        });
    });
}

exports.addPlayer = function(player) {
    return db.addPlayer({
        uid: player.name.toLowerCase().replace(/ /, ""),
        name: player.name,
        status: 'A'
    });
}