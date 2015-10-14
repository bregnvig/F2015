'use strict';

angular.module('f2015.authentication', ['ngResource', 'config'])
  .factory('authenticationService', ['$window', '$q', '$rootScope', '$resource', 'ENV', 'credentials', 'Player', function($window, $q, $rootScope, $resource, ENV, credentials, Player) {

    var authenticationResource = $resource(ENV.apiEndpoint + '/ws/login/:userName/:password', null, {
      'login': {
        method: 'GET',
        noAuthorization: true
      }
    });

    function setLoggedIn(value) {
      credentials(new Player(value));
    }

    return {
      login: function(userName, password) {
        delete localStorage.credentials;
        return authenticationResource.login({
          userName: userName,
          password: password
        }, function(result) {
          setLoggedIn(result);
        });
      },
      save: function() {
        credentials().then(function(credentials) {
          localStorage.credentials = angular.toJson(credentials);
        });
      },
      load: function() {
        if (localStorage.credentials) {
          setLoggedIn(angular.fromJson(localStorage.credentials));
        }
      }
    };
  }])
  .factory('credentials', ['$q', function($q) {
    var credentials = $q.defer();

    return function(value) {
      if (value) {
        credentials.resolve(value);
      } else {
        return credentials.promise;
      }
    };
  }])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('apiSecurityInterceptor');
  }])
  .run(['authenticationService', function(authenticationService) {
    authenticationService.load();
  }])
  .factory('apiSecurityInterceptor', ['$window', 'ENV', 'credentials', function($window, ENV, credentials) {

    return {
      'request': function(config) {
        if (config.url.indexOf(ENV.apiEndpoint) === 0) {
          if (config.noAuthorization) {
            return config;
          } else {
            return credentials().then(function(credentials) {
              config.headers.Authorization = 'Basic ' + $window.btoa(credentials.playername + ':' + credentials.token);
              return config;
            });
          }
        } else {
          return config;
        }
      }
    };
  }]);
