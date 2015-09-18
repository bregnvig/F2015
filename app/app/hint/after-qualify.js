'use strict';

angular.module('f2015.hint.afterQualify', ['f2015.model.ergast', 'f2015.model.race'])
  .directive('afterQualifyCard', ['raceModel', 'intermediateResult', function(raceModel, intermediateResult) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/after-qualify-card.tmpl.html',
      link: function($scope, element) {
        $scope.$on('current-race', function (event, race) {
          intermediateResult(race).then(function(race) {
            $scope.bids = race.bids;
            element.removeClass('ng-hide');
          });
        });
        $scope.limit = 3;
        $scope.showToggle = function() {
          $scope.limit = $scope.limit === 1000 ? 3 : 1000;
        };
      }
    };
  }])
  .factory('intermediateResult', ['$q', 'raceModel', 'driverModel', 'ergastModel', function($q, raceModel, driverModel, ergastModel) {

    var intermediateRaceResult;

    return function(race) {


      var deferred = $q.defer();
      if (intermediateRaceResult) {
        deferred.resolve(intermediateRaceResult);
      }
      if (!intermediateRaceResult && race && race.closed === true && race.completed === false) {
        ergastModel.getCurrentQualify(race.circuitId, function(qualifyResults) {
          if (qualifyResults && qualifyResults.length) {
            var intermediateResult = {
              grid: [],
              selectedDriver: []
            };
            driverModel.activeDrivers.$promise.then(function() {
              qualifyResults.forEach(function(result, index) {
                if (index < 7) {
                  intermediateResult.grid.push(driverModel.getDriver(result.Driver.driverId));
                }
                if (race.selectedDriver.code === result.Driver.driverId) {
                  intermediateResult.selectedDriver.push(result.position);
                }
              });
              intermediateRaceResult = raceModel.submitIntermediate(race, intermediateResult);
              intermediateRaceResult.$promise.then(function() {
                deferred.resolve(intermediateRaceResult);
              });
            });
          } else {
            deferred.reject();
          }
        });
      }
      return deferred.promise;
    };
  }]);
