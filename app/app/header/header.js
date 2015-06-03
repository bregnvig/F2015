'use strict';

angular.module('f2015.header', [])
  .controller('HeaderCtrl', ['$scope', '$http', '$mdSidenav', 'ENV', 'authenticationService' ,function($scope, $http, $mdSidenav, ENV, authentication) {
    var header = this;
    header.credentials = authentication.credentials;
    $scope.$mdSidenav = $mdSidenav;
    $scope.$watch('$mdSidenav(\'drawer\').isLockedOpen()', function (newValue) {
      header.menuButtonHidden = newValue;
    });
    header.toggleMenu = function() {
      $mdSidenav('drawer').toggle();
    };
    $http.get(ENV.apiEndpoint+'/ws/season-name').then(function(response) {
      header.seasonName = response.data;
    });
  }])
  .controller('MenuCtrl', ['$scope', '$mdSidenav', 'ENV', 'accountService', 'authenticationService', function($scope, $mdSidenav, ENV, account, authentication) {
    var menu = this;
    menu.account = account.get;
    menu.credentials = authentication.credentials;
    menu.toggle = function() {
      $mdSidenav('drawer').toggle();
    };
    $scope.$mdSidenav = $mdSidenav;
    $scope.revision = ENV.revision;
    $scope.$watch('$mdSidenav(\'drawer\').isLockedOpen()', function (newValue) {
      menu.closeButtonHidden = newValue;
    });
  }]);
