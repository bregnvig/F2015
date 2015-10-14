'use strict';

angular.module('f2015.account', ['ngResource', 'config', 'ngMaterial'])
  .factory('account', ['$window', '$rootScope', '$resource', 'ENV', 'credentials', function($window, $rootScope, $resource, ENV, credentials) {

    var account = {};

    var accountBackend = $resource(ENV.apiEndpoint + '/ws/v2/player/:playerName/account', {
      'playerName': '@playername'
    });

    function refreshAccount(params) {
      accountBackend.get(params, function(result) {
        angular.copy(result, account);
      });
    }

    credentials().then(function(player) {
      var params = {
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

