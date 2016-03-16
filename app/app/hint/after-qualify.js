'use strict';

angular.module('f2015.hint.afterQualify', ['f2015.model.ergast', 'f2015.model.race'])
  .directive('afterQualifyCard', ['raceModel', 'intermediateResult', 'cardShowHide', function(raceModel, intermediateResult, cardShowHide) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/after-qualify-card.tmpl.html',
      controllerAs: '$ctrl',
      controller: [function() {
        const $ctrl = this;
        raceModel.current.$promise.then((race) => {
          intermediateResult(race).then((race) => $ctrl.bids = race.bids);
        });
        $ctrl.limit = 3;
        $ctrl.showToggle = () => $ctrl.limit = $ctrl.limit === 1000 ? 3 : 1000;
        $ctrl.isVisible = () => $ctrl.bids;
      }],
      link: cardShowHide
    };
  }])
  .factory('intermediateResult', ['$q', 'raceModel', 'driverModel', 'ergastModel', function($q, raceModel, driverModel, ergastModel) {

    let intermediateRaceResultPromise;

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
