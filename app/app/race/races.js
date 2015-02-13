'use strict';

angular.module('f2015.race', ['f2015.model.race', 'f2015.model.ergast'])
  .controller('RacesCtrl', ['raceModel', function(raceModel) {
    var races = this;
    races.races = raceModel;
  }])
  .controller('RaceCtrl', ['$state', '$stateParams', '$mdDialog', 'raceModel', function($state, $stateParams, $mdDialog, raceModel) {
    var race = this;
    race.get = raceModel.get($stateParams.id);
    race.rollback = function() {
      var confirm = $mdDialog.confirm()
        .title('Rul resultatet tilbage?')
        .content('Er du sikker på du ønsker at rulle resultatet for ' + race.get.name + ' tilbage?')
        .ok('Ja')
        .cancel('Ellers tak!');
      $mdDialog.show(confirm).then(function() {
        raceModel.rollback(race.get, function() {
          $state.go('races');
        });
      });
    };
  }])
  .controller('BidCtrl', ['$stateParams', 'raceModel', function($stateParams, raceModel) {
    var bid = this;
    bid.get = raceModel.bid($stateParams.id, $stateParams.player);
  }])
  .controller('ResultCtrl', ['$stateParams', 'raceModel', function($stateParams, raceModel) {
    var bid = this;
    bid.get = raceModel.result($stateParams.id);
  }])
  .directive('joinRaceCard',['raceModel', function(raceModel) {
    return {
      restrict: 'E',
      templateUrl: 'app/race/join-race-card.tmpl.html',
      link: function($scope, element) {
        $scope.race = raceModel.current;
        $scope.$watch('race', function (newValue) {
          if (newValue && newValue.name) {
            element.removeClass('ng-hide');
          }
        }, true);
      }
    };
  }])
  .controller('CreateResultCtrl', ['$stateParams', '$state', 'raceModel', 'ergastModel', 'raceResultCreator', function($stateParams, $state, raceModel, ergastModel, raceResultCreator) {
    var bid = this;
    raceModel.get($stateParams.id).$promise.then(function(race) {
      ergastModel.getCurrentResults(race.circuitId, function(results) {
        var raceResult = raceResultCreator(race.selectedDriver.code, results);
        ergastModel.getCurrentQualify(race.circuitId, function(qualifyResult) {
          var times = /(\d):(\d{2})\.(\d{3})/.exec(qualifyResult[0].Q3);
          var millis = times[1] * 1000 * 60;
          millis += times[2] * 1000;
          millis += times[3];
          raceResult.polePositionTime = parseInt(millis);
          raceResult.polePositionTimeInText = qualifyResult[0].Q3;
          bid.get = raceResult;
          bid.get.driver = race.selectedDriver;
          bid.submitResult = function() {
            raceModel.submitResult(race, raceResult, function() {
              $state.go('race', {'id': race.id});
            });
          };
        });
      });
    });
  }])
  .factory('raceResultCreator', ['driverModel', function(driverModel) {

    return function(selectedDriverCode, results) {
      var raceResult = {
        grid: [],
        fastestLap: undefined,
        firstCrashes: [],
        podium:[],
        selectedDriver: [],
        polePositionTime: undefined
      };
      results.forEach(function(result) {
        var code = result.Driver.code;
        if (result.grid <= 7) {
          raceResult.grid[result.grid-1] = driverModel.getDriver(code);
        }
        if (result.FastestLap && result.FastestLap.rank === '1') {
          raceResult.fastestLap = driverModel.getDriver(code);
        }
        if (result.position <= 4) {
          raceResult.podium[result.position-1] = driverModel.getDriver(code);
        }
        if (code === selectedDriverCode) {
          raceResult.selectedDriver[0] = parseInt(result.grid);
          raceResult.selectedDriver[1] = parseInt(result.position);
        }
        if (result.positionText === 'R') {
          if (raceResult.firstCrashes.length === 3) {
            raceResult.firstCrashes.pop();
          }
          raceResult.firstCrashes.push(driverModel.getDriver(code));
        }
      });
      return raceResult;
    };
  }]);

