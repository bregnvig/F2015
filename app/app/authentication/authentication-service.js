'use strict';

angular.module('f2015.authentication', ['ngResource', 'config'])
  .factory('authenticationService', ['$window', '$rootScope', '$resource', 'ENV', function($window, $rootScope, $resource, ENV) {

    var resource = $resource(ENV.apiEndpoint + '/ws/login/:userName/:password');
    var credentials;

    function loggedIn(value) {
      credentials = value;
      $rootScope.$broadcast('login-successful', credentials);
    }

    return {
      login: function(userName, password) {
        credentials = null;
        delete localStorage.credentials;
        return resource.get({userName: userName, password: password}, function(result) {
          loggedIn(result);
        }, function() {
          $rootScope.$broadcast('login-failed');
        });
      },
      save:function() {
        credentials.$promise.then(function() {
          localStorage.credentials = angular.toJson(credentials);
        });
      },
      load:function() {
        if (!credentials && localStorage.credentials) {
          loggedIn(angular.fromJson(localStorage.credentials));
        } else {
          $rootScope.$broadcast('login-failed');
        }
        return credentials;
      },
      get loggedIn() {
        return !!credentials;
      }

    };
  }])
  .run(['$timeout', 'authenticationService', function($timeout, authenticationService) {
    $timeout(function() {
      authenticationService.load();
    }, 300);
  }]);
