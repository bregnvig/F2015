'use strict';

angular.module('f2015.account', ['f2015.resource', 'config'])
  .factory('accountService', ['$window', '$rootScope', 'secureResource', 'ENV', function($window, $rootScope, secureResource, ENV) {

    var account;

    var accountBackend;

    accountBackend = secureResource(ENV.apiEndpoint+'/ws/player/account');
    account = accountBackend.get();

    return {
      get get() {
        return account;
      }
    };
  }]);

