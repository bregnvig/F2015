'use strict';

angular.module('f2015.authentication', ['ngResource', 'config'])
  .factory('authenticationService', ['$resource', 'ENV', function($resource, ENV) {

    var resource = $resource(ENV.apiEndpoint + '/login/:userName/:password');

    return {
      login: function(userName, password) {
        return resource.get({userName: userName, password: password});
      },
      save:function(credentials) {
        credentials.$promise.then(function() {
          localStorage.credentials = angular.toJson(credentials);
        });
      },
      load:function() {
        if (localStorage.credentials) {
          return angular.fromJson(localStorage.credentials);
        }
        return undefined;
      }
    };
  }]);
