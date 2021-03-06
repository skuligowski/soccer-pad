angular.module('views.ratings', ['data.dataSource', 'controls.sortable']).

controller('RatingsCtrl', ['$scope', 'dataSource', function($scope, dataSource) {

    var reloadTable = function() {
        var players = $scope.model.players,
            selectedPeriod = $scope.selectedPeriod = $scope.selectedPeriod || $scope.model.periods[0],
            ratings = $scope.model.ratings[selectedPeriod.uid];
        
        if (!ratings)
            return;

        $scope.tableRows = [];
        
        for (var i = 0; i < players.length; i++) {
            var player = players[i],
                playerUid = player.uid,
                rating = ratings[playerUid];

            if (!rating || player.disabled)
                continue;
            var gamesTotal = rating.bATotal + rating.bDTotal + rating.wATotal + rating.wDTotal,
                winsTotal = rating.bAWins + rating.bDWins + rating.wAWins + rating.wDWins;
            var tableRow = {
                name : player.name,
                mean : rating.tsMean - 3*rating.tsSd,
                change : Math.abs(rating.tsMeanChange),
                meanUp: rating.tsMeanChange >= 0,
                games: gamesTotal,
                wins: winsTotal,
                loss: gamesTotal - winsTotal,
                winPerc : winsTotal / gamesTotal * 100,
                winD: rating.wDWins + rating.bDWins,
                lossD: rating.wDTotal - rating.wDWins + rating.bDTotal - rating.bDWins,
                winA: rating.wAWins + rating.bAWins,
                lossA: rating.wATotal - rating.wAWins + rating.bATotal - rating.bAWins,
                winW : rating.wAWins + rating.wDWins,
                lossW : rating.wATotal - rating.wAWins + rating.wDTotal - rating.wDWins,
                winB : rating.bAWins + rating.bDWins,
                lossB : rating.bATotal - rating.bAWins + rating.bDTotal - rating.bDWins,
                greenBadges : rating.greenBadgesTotal
            }
            $scope.tableRows.push(tableRow);

        }
    }

    $scope.$watch('model.ratings', reloadTable);
    $scope.$watch('selectedPeriod', reloadTable);
}]);





