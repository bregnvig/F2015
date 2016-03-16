'use strict';

angular.module('f2015.home', [])
  .controller('HomeCtrl', ['$scope', 'currentRace', 'credentials', function($scope, currentRace, credentials) {
    credentials().then(function() {
      $scope.loggedIn = true;
    });
    $scope.currentRace = currentRace;
  }]);
