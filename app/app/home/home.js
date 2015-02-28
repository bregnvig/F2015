'use strict';

angular.module('f2015.home', [])
  .controller('HomeCtrl', ['$scope', 'authenticationService', function ($scope, authenticationService) {
    $scope.loggedIn = authenticationService.loggedIn;
    $scope.$on('login-successful', function () {
      $scope.loggedIn = true;
    });
    $scope.$on('login-failed', function () {
      $scope.loggedIn = false;
    });
  }]);
