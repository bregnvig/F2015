'use strict';

angular.module('f2015.header', [])
  .directive('f2015Header', [function() {
    return {
      restrict: 'E',
      templateUrl: 'app/header/header.tmpl.html',
      controller: function($scope, $mdSidenav) {
        $scope.toggleMenu = function() {
          console.log('Is open' + $mdSidenav('drawer').isOpen());
          //$mdSidenav('drawer').toggle();
        };
      }
    };
  }]);
