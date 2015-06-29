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
  .controller('DriverCtrl', ['$scope', '$stateParams', 'ergastModel', 'allDrivers', 'authenticationService', function($scope, $stateParams, ergastModel, allDrivers, authentication) {
    var driver = this;
    driver.credentials = authentication.credentials;
    driver.previousYear = ergastModel.previousSeason;
    driver.currentYear = ergastModel.currentSeason;
    allDrivers.$promise.then(function() {
      var filtered = allDrivers.filter(function(temp) {
        return temp.id === parseInt($stateParams.id);
      });
      console.log('Driver', driver.get);
      if (filtered && filtered.length) {
        driver.get = filtered[0];
        driver.qualifyResult = ergastModel.getLastYearDriverQualify(driver.get.code);
        driver.raceResult = ergastModel.getLastYearDriverResults(driver.get.code);
        ergastModel.getCurrentYearDriverStatus(driver.get.code, function(result) {
          driver.retired = result.reduce(function (previousValue, status) {
            return previousValue + (status.status === 'Finished' ? 0 : parseInt(status.count));
          }, 0).toFixed(1);
        });
        ergastModel.getCurrentYearDriverQualify(driver.get.code, function(result) {
          driver.currentQualifyResult = result;
          var grid = result.reduce(function (previousValue, race) {
            return previousValue + parseInt(race.QualifyingResults[0].position);
          }, 0);
          driver.avgGrid = result.length !== 0 ? (grid / result.length).toFixed(1) : '-';
        });
        ergastModel.getCurrentYearDriverResults(driver.get.code, function(result) {
          driver.currentRaceResult = result;
          var position = result.reduce(function(previousValue, race) {
            return previousValue + parseInt(race.Results[0].position);
          }, 0);
          driver.avgPosition = result.length !== 0 ? (position / result.length).toFixed(1) : '-';
        });
      }
    });
    $scope.$watch(function() {
      return driver.get ? driver.get.active : undefined;
    }, function(newValue) {
      if (newValue !== undefined) {
        driver.get.partOfSeason = true;
        driver.get.$save();
      }
    });
  }]);
