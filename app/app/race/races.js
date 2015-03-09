'use strict';

angular.module('f2015.race', ['f2015.model.race', 'f2015.model.ergast'])
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
          currentRace: ['$stateParams', 'raceModel', function($stateParams, raceModel) {
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
            return driverModel.activeDrivers;
          }]
        },
        views: {
          '@': {
            templateUrl: 'app/race/enter-bid.tmpl.html',
            controller: 'EnterBidCtrl as enterBid'
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
      });
  }])
  .controller('RacesCtrl', ['raceModel', function(raceModel) {
    var races = this;
    races.races = raceModel;
  }])
  .controller('RaceCtrl', ['$state', '$mdDialog', 'currentRace', 'raceModel', 'authenticationService', function($state, $mdDialog, currentRace, raceModel, authenticationService) {
    var race = this;
    race.get = currentRace;
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
  }])
  .controller('OldRaceCtrl', ['raceModel', 'ergastModel', function(raceModel, ergastModel) {
    var oldRace = this;
    oldRace.race = raceModel.current;
    oldRace.race.$promise.then(function(race) {
      oldRace.previousSeason = ergastModel.previousSeason;
      oldRace.qualifyResult = ergastModel.getLastSeasonQualify(race.circuitId);
      oldRace.raceResult= ergastModel.getLastSeasonResults(race.circuitId);
    });
  }])
  .controller('BidCtrl', ['$stateParams', 'currentRace', function($stateParams, currentRace) {
    var bid = this;
    currentRace.$promise.then(function() {
      bid.race = currentRace;
      for(var i = 0; i < currentRace.bids.length; i++){
        if (currentRace.bids[i].player.playername === $stateParams.player) {
          bid.get = currentRace.bids[i];
          break;
        }
      }
    });
  }])
  .controller('EnterBidCtrl', ['$scope', '$state', 'currentRace', 'drivers', 'raceModel', function($scope, $state, currentRace, drivers, raceModel) {
    var enterBid = this;
    enterBid.race = currentRace;
    enterBid.drivers = drivers;
    enterBid.bid = localStorage.bid ? angular.fromJson(localStorage.bid) : {};
    if (!enterBid.bid.grid) {
      enterBid.bid.grid = [];
      enterBid.bid.podium = [];
      enterBid.bid.selectedDriver = [];
    }

    $scope.$on('$stateChangeStart', function() {
      localStorage.bid = angular.toJson(enterBid.bid);
    });

    enterBid.submitBid = function() {
      var submit = {};
      submit.grid = enterBid.bid.grid;
      submit.fastestLap = enterBid.bid.fastestLap;
      submit.podium = enterBid.bid.podium;
      submit.firstCrash = enterBid.bid.firstCrash;
      submit.selectedDriver = enterBid.bid.selectedDriver;
      submit.polePositionTime = (60 * 1000 * enterBid.bid.minutes) + (1000 * enterBid.bid.seconds) + enterBid.bid.milliseconds;
      raceModel.submitBid(submit, function() {
        localStorage.bid = undefined;
        $state.go('f2015.home');
      });
    };

  }])
  .controller('ResultCtrl', ['$stateParams', 'currentRace', function($stateParams, currentRace) {
    var bid = this;
    bid.get = currentRace.raceResult;
  }])
  .directive('joinRaceCard',['raceModel', function(raceModel) {
    return {
      restrict: 'E',
      templateUrl: 'app/race/join-race-card.tmpl.html',
      link: function($scope, element) {
        $scope.race = raceModel.current;
        $scope.$watch('race', function (newValue) {
          if (newValue && newValue.name && newValue.participant === false) {
            element.removeClass('ng-hide');
          }
        }, true);
      }
    };
  }])
  .controller('CreateResultCtrl', ['$stateParams', '$state', 'currentRace', 'raceModel', 'ergastModel', 'raceResultCreator', function($stateParams, $state, currentRace, raceModel, ergastModel, raceResultCreator) {
    var bid = this;
    ergastModel.getCurrentResults(currentRace.circuitId, function(results) {
      var raceResult = raceResultCreator(currentRace.selectedDriver.code, results);
      ergastModel.getCurrentQualify(currentRace.circuitId, function(qualifyResult) {
        var times = /(\d):(\d{2})\.(\d{3})/.exec(qualifyResult[0].Q3);
        var millis = times[1] * 1000 * 60;
        millis += times[2] * 1000;
        millis += times[3];
        raceResult.polePositionTime = parseInt(millis);
        raceResult.polePositionTimeInText = qualifyResult[0].Q3;
        bid.get = raceResult;
        bid.get.driver = currentRace.selectedDriver;
        bid.submitResult = function() {
          raceModel.submitResult(currentRace, raceResult, function() {
            //$state.go('f2015.race', {'id': currentRace.id}, {reload: true});
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
  }])
  .directive('unique', function() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, elem, attrs, ngModel) {
        if(!ngModel) {
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
              if (driver && val1.id === driver.id) {
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

