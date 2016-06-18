'use strict';

angular.module('f2015.race', ['ngMessages', 'f2015.model.race', 'f2015.model.ergast'])
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('f2015.races', {
        url: '/race',
        views: {
          '@': {
            template: '<races></races>'
          }
        }
      })
      .state('f2015.old-race', {
        url: '/race/last-year',
        views: {
          '@': {
            template: '<old-race></old-race>',
          }
        }
      })
      .state('f2015.race', {
        url: '/race/:id',
        cache: false,
        views: {
          '@': {
            template: '<race></race>'
          }
        }
      })
      .state('f2015.race.enter-bid', {
        url: '/enter-bid',
        views: {
          '@': {
            template: '<enter-bid></enter-bid>'
          }
        }
      })
      .state('f2015.race.result', {
        url: '/result',
        views: {
          '@': {
            template: '<race-result></race-result>'
          }
        }
      })
      .state('f2015.race.create-result', {
        url: '/create-result',
        views: {
          '@': {
            template: '<create-result></create-result>'
          }
        }
      })
      .state('f2015.race.bid', {
        url: '/:player',
        views: {
          '@': {
            template: '<bid></bid>'
          }
        }
      });
  }])
  .component('races', {
    templateUrl: 'app/race/races.tmpl.html',
    controller: ['$state', 'raceModel', function($state, raceModel) {
      const $ctrl = this;
      $ctrl.races = raceModel;
      $ctrl.navigateTo = (race) => {
        $state.go('f2015.race', {
          id: race.id
        });
      };
    }]
  })
  .component('race', {
    templateUrl: 'app/race/race.tmpl.html',
    controller: ['$state', '$stateParams', '$mdDialog', 'raceModel', 'credentials', function($state, $stateParams, $mdDialog, raceModel, credentialsProvider) {
      const $ctrl = this;
      $ctrl.get = raceModel.get($stateParams.id);
      $ctrl.currentRace = raceModel.current;
      credentialsProvider().then((credentials) => $ctrl.credentials = credentials);
      $ctrl.rollback = () => {
        const confirm = $mdDialog.confirm()
          .title('Rul resultatet tilbage?')
          .textContent('Er du sikker på du ønsker at rulle resultatet for ' + $ctrl.get.name + ' tilbage?')
          .ok('Ja')
          .cancel('Ellers tak!');
        $mdDialog.show(confirm).then(() => raceModel.rollback($ctrl.get, () => $state.go('f2015.races')));
      };
      $ctrl.navigateTo = $state.go;
    }]
  })
  .component('oldRace', {
    templateUrl: 'app/race/old-race.tmpl.html',
    controller: ['$interval', 'raceModel', 'ergastModel', function($interval, raceModel, ergastModel) {
      const $ctrl = this;
      $ctrl.race = raceModel.current;
      $ctrl.race.$promise.then((race) => {
        $ctrl.previousSeason = ergastModel.previousSeason;
        ergastModel.getLastSeasonQualify(race.circuitId, (qualifyResults) => {
          $ctrl.qualifyResult = qualifyResults;
          $interval(() => qualifyResults.forEach((result) => $ctrl.qualifyTime(result)), 2500);
        });
        ergastModel.getLastSeasonResults(race.circuitId, (drivers) => {
          $ctrl.raceResult = drivers;
          $ctrl.fastestLaps = angular.copy(drivers);
          $ctrl.fastestLaps.sort((a, b) => (a.FastestLap ? a.FastestLap.rank : 1000) - (b.FastestLap ? b.FastestLap.rank : 1000));
        });
        $ctrl.withFastestLap = (driver) => driver.FastestLap ? true : false;
        $ctrl.qualifyTime = (result) => {
          const max = result.Q3 ? 3 : (result.Q2 ? 2 : 1);
          if (!result.Q) {
            result.QPos = max;
          }
          result.QPos = result.QPos - 1 < 1 ? max : result.QPos - 1;
          result.Q = 'Q' + (result.QPos) + ' - ' + result['Q' + result.QPos];
        };
      });
    }]
  })
  .component('bid', {
    templateUrl: 'app/race/bid.tmpl.html',
    controller: ['$stateParams', 'raceModel', function($stateParams, raceModel) {
      const $ctrl = this;
      raceModel.get($stateParams.id).$promise.then((selectedRace) => {
        $ctrl.race = selectedRace;
        $ctrl.bid = selectedRace.bids.find((bid) => bid.player.playername === $stateParams.player);
      });
    }]
  })
  .component('enterBid', {
    templateUrl: 'app/race/enter-bid.tmpl.html',
    controller: ['$scope', '$state', '$stateParams', 'raceModel', 'driverModel', function($scope, $state, $stateParams, raceModel, driverModel) {
      const $ctrl = this;
      raceModel.current.$promise.then((race) => {
        $ctrl.race = race;
        $ctrl.bid = localStorage['bid' + race.id] ? angular.fromJson(localStorage['bid' + race.id]) : {};
        $ctrl.drivers = driverModel.activeDrivers;
        if (!$ctrl.bid.grid) {
          $ctrl.bid.grid = [];
          $ctrl.bid.podium = [];
          $ctrl.bid.selectedDriver = [];
        }
        $ctrl.getDriver = driverModel.getDriver;
        $scope.$on('$stateChangeStart', () => localStorage['bid' + race.id] = angular.toJson($ctrl.bid));
      });
      $ctrl.submitBid = () => {
        const submit = {};
        submit.grid = driverModel.convert($ctrl.bid.grid);
        submit.fastestLap = driverModel.convert($ctrl.bid.fastestLap);
        submit.podium = driverModel.convert($ctrl.bid.podium);
        submit.firstCrash = driverModel.convert($ctrl.bid.firstCrash);
        submit.selectedDriver = $ctrl.bid.selectedDriver;
        submit.polePositionTime = (60 * 1000 * $ctrl.bid.minutes) + (1000 * $ctrl.bid.seconds) + $ctrl.bid.milliseconds;
        raceModel.submitBid(submit, () => {
          localStorage['bid' + $ctrl.race.id] = undefined;
          $state.go('f2015.home');
        });
      };
    }]
  })
  .component('raceResult', {
    templateUrl: 'app/race/bid.tmpl.html',
    controller: ['$stateParams', 'raceModel', function($stateParams, raceModel) {
      const $ctrl = this;
      raceModel.get($stateParams.id).$promise.then((result) => {
        $ctrl.race = result;
        $ctrl.bid = result.raceResult;
      });
    }]
  })
  .directive('joinRaceCard', ['raceModel', 'cardShowHide', function(raceModel, cardShowHide) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/race/join-race-card.tmpl.html',
      controllerAs: '$ctrl',
      controller() {
        const $ctrl = this;
        raceModel.current.$promise.then((race) => {
          const diff = race.closeDate.getTime() - Date.now();
          $ctrl.race = race;
          $ctrl.closingSoon = diff < (1000 * 60 * 60 * 24 * 2);
          raceModel.get(race.id).$promise.then((race) => $ctrl.participant = race.participant);
        });
        $ctrl.isVisible = () => $ctrl.participant === false && $ctrl.race.opened;
      },
      link: cardShowHide
    };
  }])
  .component('createResult', {
    templateUrl: 'app/race/bid.tmpl.html',
    controller: ['$stateParams', '$state', 'raceModel', 'ergastModel', 'raceResultCreator', function($stateParams, $state, raceModel, ergastModel, raceResultCreator) {
      const $ctrl = this;
      raceModel.get($stateParams.id).$promise.then((selectedRace) => {
        $ctrl.race = selectedRace;
        ergastModel.getCurrentResults(selectedRace.circuitId).$promise.then((results) => {
          ergastModel.getCurrentQualify(selectedRace.circuitId).$promise.then((qualifyResult) => {
            $ctrl.bid = raceResultCreator(selectedRace.selectedDriver.code, results, qualifyResult);
            $ctrl.bid.driver = selectedRace.selectedDriver;
            const result = qualifyResult[0].Q3 || qualifyResult[0].Q2 || qualifyResult[0].Q1;
            const times = /(\d):(\d{2})\.(\d{3})/.exec(result);
            let millis = times[1] * 1000 * 60;
            millis += times[2] * 1000;
            millis += parseInt(times[3]);
            $ctrl.bid.polePositionTime = parseInt(millis);
            $ctrl.bid.polePositionTimeInText = result;
            $ctrl.submitResult = () => {
              raceModel.submitResult(selectedRace, $ctrl.bid, () => $state.go('f2015.races'));
            };
          });
        });
      });
    }]
  })
  .factory('raceResultCreator', ['driverModel', function(driverModel) {

    return function(selectedDriverCode, ergastRaceResult, ergastQualifyResult) {
      const raceResult = {
        grid: [],
        fastestLap: undefined,
        firstCrashes: [],
        podium: [],
        selectedDriver: [],
        polePositionTime: undefined
      };
      ergastQualifyResult.forEach((result) => {
        if (result.position <= 7) {
          raceResult.grid[result.position - 1] = driverModel.getDriver(result.Driver.driverId);
        }
      });
      ergastRaceResult.forEach((result) => {
        const driverId = result.Driver.driverId;
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
      link(scope, elem, attrs, ngModel) {
        if (!ngModel) {
          console.log('No model - ejecting');
          return;
        }

        const validate = (values) => {
          // values
          const val1 = ngModel.$viewValue;
          let count = 0;
          if (val1) {
            count = values.reduce((count, driver) => count + (driver && val1 === driver ? 1 : 0), 0);
          }
          // set validity
          ngModel.$setValidity('unique', !val1 || count <= 1);
        };

        scope.$watch(attrs.unique, (values) => {
          validate(values);
        }, true);

      }
    };
  });

