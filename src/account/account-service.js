'use strict';

angular.module('f2015.account', ['f2015.model.account', 'config', 'ngMaterial'])
  .factory('account', ['$rootScope', 'ENV', 'credentials', 'Account', function($rootScope, ENV, credentials, Account) {

    var account = {};

    function refreshAccount(params) {
      Account.get(params, function(result) {
        angular.copy(result, account);
      });
    }

    credentials().then(function(player) {
      const params = {
        playerName: player.playername
      };
      refreshAccount(params);
      $rootScope.$on('bid-submitted', function() {
        refreshAccount(params);
      });
      $rootScope.$on('wbc-joined', function() {
        refreshAccount(params);
      });
    });
    return account;
  }]);

