'use strict';

angular.module('f2015.account', ['ngResource', 'config'])
  .factory('accountService', ['$window', '$rootScope', '$resource', 'ENV', function($window, $rootScope, $resource, ENV) {

    var account;

    var accountBackend;

    $rootScope.$on('login-successful', function() {
      accountBackend = $resource(ENV.apiEndpoint+'/ws/player/account');
      account = accountBackend.get();
    });

    return {
      get get() {
        return account;
      }
    };
  }]);

