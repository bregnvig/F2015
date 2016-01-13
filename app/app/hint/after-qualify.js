'use strict';

angular.module('f2015.hint.afterQualify', ['f2015.model.ergast', 'f2015.model.race'])
  .directive('afterQualifyCard', ['raceModel', 'intermediateResult', function(raceModel, intermediateResult) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/after-qualify-card.tmpl.html',
      controllerAs: 'afterQualifyCtrl',
      controller: [function() {
        var vm = this;
        raceModel.current.$promise.then(function(race) {
          intermediateResult(race).then(function(race) {
            vm.bids = race.bids;
          });
        });
        vm.limit = 3;
        vm.showToggle = function() {
          vm.limit = vm.limit === 1000 ? 3 : 1000;
        };
      }]
    };
  }])
  .factory('intermediateResult', ['$q', 'raceModel', 'driverModel', 'ergastModel', function($q, raceModel, driverModel, ergastModel) {

    var intermediateRaceResultPromise;

    return function(race) {

      if (!intermediateRaceResultPromise) {
        intermediateRaceResultPromise = $q(function(resolve, reject) {
          if (race && race.closed === true && race.completed === false) {
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
                  raceModel.submitIntermediate(race, intermediateResult, function(intermediateRaceResult) {
                    resolve(intermediateRaceResult);
                  });
                });
              } else {
                reject();
              }
            });
          } else {
            reject();
          }
        });
      }
      return intermediateRaceResultPromise;
    };
  }]);
