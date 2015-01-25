'use strict';

angular.module('f2015.header', [])
  .directive('f2015Header', [function() {
    return {
      restrict: 'E',
      templateUrl: 'app/header/header.tmpl.html',
      controller: 'HeaderCtrl as header'
    };
  }])
  .controller('HeaderCtrl', ['$scope', '$http', '$mdSidenav', 'ENV','authenticationService', 'accountService', function($scope, $http, $mdSidenav, ENV, authentication, account) {
    var header = this;

    header.account = account;

    function initializeHeader(credentials) {
      header.credentials = credentials;
      if (credentials) {
        account.get;
      }
    }

    initializeHeader(authentication.credentials);

    header.toggleMenu = function() {
      $mdSidenav('drawer').toggle();
    };

    $scope.$on('login-successful', function (event, credentials) {
      initializeHeader(credentials);
    });
    $scope.$on('login-failed', function () {
      initializeHeader();
    });
    $http.get(ENV.apiEndpoint+'/ws/season-name').then(function(response) {
      header.seasonName = response.data;
    });
  }]);
