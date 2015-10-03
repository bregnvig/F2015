'use strict';

angular.module('f2015.race', ['ngMessages', 'f2015.model.race', 'f2015.model.ergast'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('f2015.races', {
        url: '/race',
        views: {
          '@': {
            templateUrl: 'app/race/races.tmpl.html',
            controller: 'RacesCtrl as races'
          }
        }
      })
      .state('f2015.old-race', {
        url: '/race/last-year',
        cache: false,
        views: {
          '@': {
            templateUrl: 'app/race/old-race.tmpl.html',
            controller: 'OldRaceCtrl as oldRace'
          }
        }
      })
      .state('f2015.race', {
        url: '/race/:id',
        cache: false,
        resolve: {
          selectedRace: ['$stateParams', 'raceModel', function($stateParams, raceModel) {
            return raceModel.get($stateParams.id);
          }]
        },
        views: {
          '@': {
            templateUrl: 'app/race/race.tmpl.html',
            controller: 'RaceCtrl as race'
          }
        }
      })
      .state('f2015.race.enter-bid', {
        url: '/enter-bid',
        resolve: {
          drivers: ['driverModel', function(driverModel) {
            return driverModel.activeDrivers.$promise;
          }]
        },
        views: {
          '@': {
            templateUrl: 'app/race/enter-bid.tmpl.html',
            controller: 'EnterBidCtrl as enterBid'
          }
        }
      })
      .state('f2015.race.result', {
        url: '/result',
        views: {
          '@': {
            templateUrl: 'app/race/bid.tmpl.html',
            controller: 'ResultCtrl as bid'
          }
        }
      })
      .state('f2015.race.create-result', {
        url: '/create-result',
        views: {
          '@': {
            templateUrl: 'app/race/bid.tmpl.html',
            controller: 'CreateResultCtrl as bid'
          }
        }
      })
      .state('f2015.race.bid', {
        url: '/:player',
        views: {
          '@': {
            templateUrl: 'app/race/bid.tmpl.html',
            controller: 'BidCtrl as bid'
          }
        }
      });
  }])
  .controller('RacesCtrl', ['$state', 'raceModel', 'currentRace', function($state, raceModel, currentRace) {
    var races = this;
    races.currentRace = currentRace;
    races.races = raceModel;
    races.navigateTo = function(race) {
      $state.go('f2015.race', {
        id: race.id
      });
    };
  }])
  .controller('RaceCtrl', ['$state', '$mdDialog', 'selectedRace', 'raceModel', 'authenticationService', function($state, $mdDialog, selectedRace, raceModel, authenticationService) {
    var race = this;
    race.get = selectedRace;
    race.credentials = authenticationService.credentials;
    race.rollback = function() {
      var confirm = $mdDialog.confirm()
        .title('Rul resultatet tilbage?')
        .content('Er du sikker på du ønsker at rulle resultatet for ' + race.get.name + ' tilbage?')
        .ok('Ja')
        .cancel('Ellers tak!');
      $mdDialog.show(confirm).then(function() {
        raceModel.rollback(race.get, function() {
          $state.go('f2015.races');
        });
      });
    };
    race.navigateTo = function(state, params) {
      $state.go(state, params);
    };
  }])
  .controller('OldRaceCtrl', ['$interval', 'currentRace', 'raceModel', 'ergastModel', function($interval, currentRace, raceModel, ergastModel) {
    var oldRace = this;
    oldRace.race = currentRace;
    oldRace.race.$promise.then(function(race) {
      oldRace.previousSeason = ergastModel.previousSeason;
      oldRace.qualifyResult = ergastModel.getLastSeasonQualify(race.circuitId);
      oldRace.qualifyResult.$promise.then(function(results) {
        $interval(function() {
          results.forEach(function(result) {
            oldRace.qualifyTime(result);
          });
        }, 2500);
      });
      oldRace.raceResult = ergastModel.getLastSeasonResults(race.circuitId);
      oldRace.raceResult.$promise.then(function(drivers) {
        oldRace.fastestLaps = angular.copy(drivers);
        oldRace.fastestLaps.sort(function(a, b) {
          return (a.FastestLap ? a.FastestLap.rank : 1000) - (b.FastestLap ? b.FastestLap.rank : 1000);
        });
      });
      oldRace.withFastestLap = function(driver) {
        return driver.FastestLap ? true : false;
      };
      oldRace.qualifyTime = function(result) {
        var max = result.Q3 ? 3 : (result.Q2 ? 2 : 1);
        if (!result.Q) {
          result.QPos = max;
        }
        result.QPos = result.QPos - 1 < 1 ? max : result.QPos - 1;
        result.Q = 'Q' + (result.QPos) + ' - ' + result['Q' + result.QPos];
      };
    });
  }])
  .controller('BidCtrl', ['$stateParams', 'selectedRace', function($stateParams, selectedRace) {
    var bid = this;
    selectedRace.$promise.then(function() {
      bid.race = selectedRace;
      for (var i = 0; i < selectedRace.bids.length; i++) {
        if (selectedRace.bids[i].player.playername === $stateParams.player) {
          bid.get = selectedRace.bids[i];
          break;
        }
      }
    });
  }])
  .controller('EnterBidCtrl', ['$scope', '$state', 'selectedRace', 'drivers', 'raceModel', 'driverModel', function($scope, $state, selectedRace, drivers, raceModel, driverModel) {
    var enterBid = this;
    enterBid.race = selectedRace;
    enterBid.bid = localStorage['bid' + selectedRace.id] ? angular.fromJson(localStorage['bid' + selectedRace.id]) : {};
    enterBid.drivers = drivers;
    if (!enterBid.bid.grid) {
      enterBid.bid.grid = [];
      enterBid.bid.podium = [];
      enterBid.bid.selectedDriver = [];
    }
    enterBid.getDriver = driverModel.getDriver;
    $scope.$on('$stateChangeStart', function() {
      localStorage['bid' + selectedRace.id] = angular.toJson(enterBid.bid);
    });

    enterBid.submitBid = function() {
      var submit = {};
      submit.grid = driverModel.convert(enterBid.bid.grid);
      submit.fastestLap = driverModel.convert(enterBid.bid.fastestLap);
      submit.podium = driverModel.convert(enterBid.bid.podium);
      submit.firstCrash = driverModel.convert(enterBid.bid.firstCrash);
      submit.selectedDriver = enterBid.bid.selectedDriver;
      submit.polePositionTime = (60 * 1000 * enterBid.bid.minutes) + (1000 * enterBid.bid.seconds) + enterBid.bid.milliseconds;
      raceModel.submitBid(submit, function() {
        localStorage['bid' + selectedRace.id] = undefined;
        $state.go('f2015.home');
      });
    };

  }])
  .controller('ResultCtrl', ['$stateParams', 'selectedRace', function($stateParams, selectedRace) {
    var bid = this;
    selectedRace.$promise.then(function() {
      bid.race = selectedRace;
      bid.get = selectedRace.raceResult;
    });
  }])
  .directive('joinRaceCard', ['raceModel', function(raceModel) {
    return {
      restrict: 'E',
      templateUrl: 'app/race/join-race-card.tmpl.html',
      link: function($scope, element) {
        var diff = raceModel.current.closeDate.getTime() - Date.now();
        $scope.closingSoon = diff < (1000 * 60 * 60 * 24 * 2);
        $scope.race = raceModel.current;
        $scope.$watch('race', function(newValue) {
          if (newValue && newValue.name && newValue.participant === false) {
            element.removeClass('ng-hide');
          }
        }, true);
      }
    };
  }])
  .controller('CreateResultCtrl', ['$stateParams', '$state', 'selectedRace', 'raceModel', 'ergastModel', 'raceResultCreator', function($stateParams, $state, selectedRace, raceModel, ergastModel, raceResultCreator) {
    var bid = this;
    ergastModel.getCurrentResults(selectedRace.circuitId).$promise.then(function(results) {
      var raceResult = raceResultCreator(selectedRace.selectedDriver.code, results);
      ergastModel.getCurrentQualify(selectedRace.circuitId).$promise.then(function(qualifyResult) {
        var times = /(\d):(\d{2})\.(\d{3})/.exec(qualifyResult[0].Q3);
        var millis = times[1] * 1000 * 60;
        millis += times[2] * 1000;
        millis += parseInt(times[3]);
        raceResult.polePositionTime = parseInt(millis);
        raceResult.polePositionTimeInText = qualifyResult[0].Q3;
        bid.get = raceResult;
        bid.race = selectedRace;
        bid.get.driver = selectedRace.selectedDriver;
        bid.submitResult = function() {
          raceModel.submitResult(selectedRace, raceResult, function() {
            // $state.go('f2015.race', {'id': selectedRace.id}, {reload: true});
            $state.go('f2015.races');
          });
        };
      });
    });
  }])
  .factory('raceResultCreator', ['driverModel', function(driverModel) {

    return function(selectedDriverCode, results) {
      var raceResult = {
        grid: [],
        fastestLap: undefined,
        firstCrashes: [],
        podium: [],
        selectedDriver: [],
        polePositionTime: undefined
      };
      results.forEach(function(result) {
        var driverId = result.Driver.driverId;
        if (result.grid <= 7) {
          raceResult.grid[result.grid - 1] = driverModel.getDriver(driverId);
        }
        if (result.FastestLap && result.FastestLap.rank === '1') {
          raceResult.fastestLap = driverModel.getDriver(driverId);
        }
        if (result.position <= 4) {
          raceResult.podium[result.position - 1] = driverModel.getDriver(driverId);
        }
        if (driverId === selectedDriverCode) {
          raceResult.selectedDriver[0] = parseInt(result.grid);
          raceResult.selectedDriver[1] = parseInt(result.position);
        }
        if (result.positionText === 'R') {
          raceResult.firstCrashes.unshift(driverModel.getDriver(driverId));
        }
      });
      if (raceResult.firstCrashes.length > 3) {
        raceResult.firstCrashes.length = 3;
      }
      return raceResult;
    };
  }])
  .directive('unique', function() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, elem, attrs, ngModel) {
        if (!ngModel) {
          console.log('No model - ejecting');
          return;
        }

        scope.$watch(attrs.unique, function(values) {
          validate(values);
        }, true);

        var validate = function(values) {
          // values
          var val1 = ngModel.$viewValue;
          var count = 0;
          if (val1) {
            values.forEach(function(driver) {
              if (driver && val1 === driver) {
                count++;
              }
            });
          }
          // set validity
          ngModel.$setValidity('unique', !val1 || count <= 1);
        };
      }
    };
  });

