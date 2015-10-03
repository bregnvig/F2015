'use strict';

angular.module('f2015.account', ['f2015.resource', 'config', 'ngMaterial'])
  .factory('accountService', ['$window', '$rootScope', 'secureResource', 'ENV', function($window, $rootScope, secureResource, ENV) {

    var account;

    var accountBackend;

    accountBackend = secureResource(ENV.apiEndpoint + '/ws/player/account');
    account = accountBackend.get();

    function updateAcccount() {
      accountBackend.get(function(result) {
        angular.copy(result, account);
      });
    }

    $rootScope.$on('bid-submitted', updateAcccount);
    $rootScope.$on('wbc-joined', updateAcccount);

    return {
      get get() {
        return account;
      }
    };
  }]);

