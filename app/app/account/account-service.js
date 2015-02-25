'use strict';

angular.module('f2015.account', ['f2015.resource', 'config', 'ngMaterial'])
  .factory('accountService', ['$window', '$rootScope', 'secureResource', 'ENV', function($window, $rootScope, secureResource, ENV) {

    var account;

    var accountBackend;

    accountBackend = secureResource(ENV.apiEndpoint+'/ws/player/account');
    account = accountBackend.get();

    $rootScope.$on('bid-submitted', function() {
      accountBackend.get(function(result) {
        angular.copy(result, account);
      });
    });

    return {
      get get() {
        return account;
      }
    };
  }]);

