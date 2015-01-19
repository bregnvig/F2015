'use strict';

angular.module('f2015.authentication').directive('loginCard', [function () {

  return {
    restrict: 'E',
    templateUrl: 'app/authentication/login-card.tmpl.html',
    controller: function($scope) {
      $scope.login = function() {
        console.log('Login now');
      };
    }
  };
}]);
