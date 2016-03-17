'use strict';

angular.module('f2015.header', [])
  .controller('HeaderCtrl', ['$scope', '$http', '$mdSidenav', 'ENV', 'credentials', function($scope, $http, $mdSidenav, ENV, credentialsProvider) {
    var vm = this;
    credentialsProvider().then(function(credentials) {
      vm.credentials = credentials;
    });
    $scope.$mdSidenav = $mdSidenav;
    $scope.$watch('$mdSidenav(\'drawer\').isLockedOpen()', function(newValue) {
      vm.menuButtonHidden = newValue;
    });
    vm.toggleMenu = function() {
      $mdSidenav('drawer').toggle();
    };
    $http({
        'url': ENV.apiEndpoint + '/ws/season-name',
        'noAuthorization': true
      }).then(function(response) {
      vm.seasonName = response.data;
    });
  }])
  .controller('MenuCtrl', ['$scope', '$mdSidenav', 'ENV', 'credentials', 'account', function($scope, $mdSidenav, ENV, credentialsProvider, account) {
    var vm = this;
    credentialsProvider().then(function(credentials) {
      vm.credentials = credentials;
    });
    vm.account = account;
    vm.toggle = function() {
      if (!vm.closeButtonHidden) {
        $mdSidenav('drawer').toggle();
      }
    };
    Object.defineProperty(vm, 'loggedIn', {
      get: function() {
        return vm.credentials && vm.credentials.playername;
      }
    });
    $scope.$mdSidenav = $mdSidenav;
    vm.revision = ENV.revision;
    $scope.$watch('$mdSidenav(\'drawer\').isLockedOpen()', function(newValue) {
      vm.closeButtonHidden = newValue;
      if (newValue) {
        $mdSidenav('drawer').close();
      }
    });
  }]);
