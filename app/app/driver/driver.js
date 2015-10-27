'use strict';

angular.module('f2015.driver', ['f2015.model.driver', 'f2015.model.ergast'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('f2015.drivers', {
        url: '/drivers',
        resolve: {
          allDrivers: ['driverModel', function(driverModel) {
            return driverModel.all;
          }]
        },
        views: {
          '@': {
            templateUrl: 'app/driver/drivers.tmpl.html',
            controller: 'DriversCtrl as drivers'
          }
        }
      })
      .state('f2015.drivers.show', {
        url: '/{id}',
        views: {
          '@': {
            templateUrl: 'app/driver/driver.tmpl.html',
            controller: 'DriverCtrl as driver'
          }
        }
      });
  }])
  .controller('DriversCtrl', ['$state', 'allDrivers', 'driverModel', 'ergastModel', function($state, allDrivers, driverModel, ergastModel) {
    var drivers = this;
    allDrivers.$promise.then(function() {
      drivers.all = allDrivers;
      ergastModel.getStandings(function(standings) {
        standings.forEach(function(standing) {
          drivers.all.forEach(function(driver) {
            if (driver.code === standing.Driver.driverId) {
              driver.points = standing.points;
            }
          });
        });
        drivers.all.sort(function(a, b) {
          return b.points - a.points;
        });
      });
    });
    drivers.navigateTo = function(state, params) {
      $state.go(state, params);
    };
  }])
  .controller('DriverCtrl', ['$scope', '$stateParams', 'ergastModel', 'allDrivers', 'credentials', function($scope, $stateParams, ergastModel, allDrivers, credentailsProvider) {
    var vm = this;
    credentailsProvider().then(function(credentials) {
      vm.credentials = credentials;
    });
    vm.previousYear = ergastModel.previousSeason;
    vm.currentYear = ergastModel.currentSeason;
    allDrivers.$promise.then(function() {
      var filtered = allDrivers.filter(function(temp) {
        return temp.id === parseInt($stateParams.id);
      });
      console.log('Driver', vm.get);
      if (filtered && filtered.length) {
        vm.get = filtered[0];
        vm.qualifyResult = ergastModel.getLastYearDriverQualify(vm.get.code);
        vm.raceResult = ergastModel.getLastYearDriverResults(vm.get.code);
        ergastModel.getCurrentYearDriverStatus(vm.get.code, function(result) {
          vm.retired = result.reduce(function(previousValue, status) {
            return previousValue + (status.status === 'Finished' ? 0 : parseInt(status.count));
          }, 0).toFixed(1);
        });
        ergastModel.getCurrentYearDriverQualify(vm.get.code, function(result) {
          vm.currentQualifyResult = result;
          var grid = result.reduce(function(previousValue, race) {
            return previousValue + parseInt(race.QualifyingResults[0].position);
          }, 0);
          vm.avgGrid = result.length !== 0 ? (grid / result.length).toFixed(1) : '-';
        });
        ergastModel.getCurrentYearDriverResults(vm.get.code, function(result) {
          vm.currentRaceResult = result;
          var position = result.reduce(function(previousValue, race) {
            return previousValue + parseInt(race.Results[0].position);
          }, 0);
          vm.avgPosition = result.length !== 0 ? (position / result.length).toFixed(1) : '-';
        });
      }
    });
    $scope.$watch(function() {
      return vm.get ? vm.get.active : undefined;
    }, function(newValue) {
      if (newValue !== undefined) {
        vm.get.partOfSeason = true;
        vm.get.$save();
      }
    });
  }]);
