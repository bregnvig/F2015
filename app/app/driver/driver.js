'use strict';

angular.module('f2015.driver', ['f2015.model.driver', 'f2015.model.ergast'])
  .controller('DriversCtrl', ['allDrivers', function(allDrivers) {
    var drivers = this;
    allDrivers.$promise.then(function() {
      drivers.all = allDrivers;
      drivers.all.sort(function(a, b) {
        return a.number - b.number;
      });
    });
  }])
  .controller('DriverCtrl', ['$scope', '$stateParams', 'ergastModel', 'allDrivers', 'authenticationService', function($scope, $stateParams, ergastModel, allDrivers, authentication) {
    var driver = this;
    driver.credentials = authentication.credentials;
    driver.previousYear = ergastModel.previousSeason;
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
          var grid = result.reduce(function (previousValue, race) {
            return previousValue + parseInt(race.QualifyingResults[0].position);
          }, 0);
          driver.avgGrid = result.length !== 0 ? (grid / result.length).toFixed(1) : '-';
        });
        ergastModel.getCurrentYearDriverResults(driver.get.code, function(result) {
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
