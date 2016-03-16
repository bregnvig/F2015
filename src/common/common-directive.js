'use strict';

angular.module('f2015.common-directive', [])
  .directive('back', ['$window', function($window) {
    return {
      restrict: 'E',
      templateUrl: 'app/common/back.tmpl.html',
      controller: function($scope) {
        $scope.back = function() {
          $window.history.back();
        };
      }
    };
  }]);
