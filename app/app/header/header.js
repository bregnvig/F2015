'use strict';

angular.module('f2015.header', [])
  .controller('HeaderCtrl', ['$scope', '$http', '$mdSidenav', 'ENV',function($scope, $http, $mdSidenav, ENV) {
    var header = this;
    function initializeHeader(credentials) {
      header.credentials = credentials;
    }
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
    $scope.$on('login-successful', function (event, credentials) {
      initializeHeader(credentials);
    });
    $scope.$on('login-failed', function () {
      initializeHeader();
    });
  }])
  .controller('MenuCtrl', ['$scope', '$mdSidenav', 'accountService', 'authenticationService', function($scope, $mdSidenav, account, authentication) {
    var menu = this;
    menu.account = account.get;
    menu.toggle = function() {
      $mdSidenav('drawer').toggle();
    };
    $scope.$mdSidenav = $mdSidenav;
    $scope.$watch('$mdSidenav(\'drawer\').isLockedOpen()', function (newValue) {
      menu.closeButtonHidden = newValue;
    });
  }]);
