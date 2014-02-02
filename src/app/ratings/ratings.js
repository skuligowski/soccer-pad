angular.module('views.ratings', ['data.dataSource', 'controls.sortable']).

controller('RatingsCtrl', ['$scope', 'dataSource', function($scope, dataSource) {
    var reloadRatings = function() {
        $scope.ratingRows = [];
        for (var playerIndex in $scope.model.players) {
            var player = $scope.model.players[playerIndex],
                playerId = player._id,
                stats = $scope.stats,
                statsT0overall = stats.ratings['T0'].overall[playerId],
                statsT0attackers = stats.ratings['T0'].attackers[playerId],
                statsT0defenders = stats.ratings['T0'].defenders[playerId],
                statsT2overall = stats.ratings['T2'].overall[playerId],
                statsT2attackers = stats.ratings['T2'].attackers[playerId],
                statsT2defenders = stats.ratings['T2'].defenders[playerId],
                statsT4overall = stats.ratings['T4'].overall[playerId],
                statsT4attackers = stats.ratings['T4'].attackers[playerId],
                statsT4defenders = stats.ratings['T4'].defenders[playerId];

            var ratingRow = {
                name : player.name,
                statsT0overallMean : statsT0overall.mean, statsT0overallsd : statsT0overall.sd,
                statsT0attackersMean : statsT0attackers.mean, statsT0attackerssd : statsT0attackers.sd,
                statsT0defendersMean : statsT0defenders.mean, statsT0defenderssd : statsT0defenders.sd,
                statsT2overallMean : statsT2overall.mean, statsT2overallsd : statsT2overall.sd,
                statsT2attackersMean : statsT2attackers.mean, statsT2attackerssd : statsT2attackers.sd,
                statsT2defendersMean : statsT0defenders.mean, statsT2defenderssd : statsT0defenders.sd,
                statsT4overallMean : statsT4overall.mean, statsT4overallsd : statsT4overall.sd,
                statsT4attackersMean : statsT4attackers.mean, statsT4attackerssd : statsT4attackers.sd,
                statsT4defendersMean : statsT0defenders.mean, statsT4defenderssd : statsT0defenders.sd
            }
            $scope.ratingRows.push(ratingRow);

        }
    }

    $scope.$watch('model.players', reloadRatings);
    reloadRatings();
}]);