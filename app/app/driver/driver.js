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
        driver.qualifyResult = ergastModel.getDriverQualify(driver.get.code);
        driver.raceResult = ergastModel.getDriverResults(driver.get.code);
      }
    });
    $scope.$watch(function() {
      return driver.get.active;
    }, function() {
      driver.get.partOfSeason = true;
      driver.get.$save();
    });
  }]);
