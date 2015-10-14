'use strict';

angular.module('f2015.model.wbc', ['ngResource', 'config'])
  .factory('wbcModel', ['$rootScope', '$resource', 'ENV', function($rootScope, $resource, ENV) {
    var wbcEntryResource = $resource(ENV.apiEndpoint+'/ws/v2/wbc/players/:playerName', {
      playerName: '@playerName'
    });
    var wbcResource = $resource(ENV.apiEndpoint+'/ws/v2/wbc');

    var wbc;
    var players = {};
    var graph;

    return {
      get: function(playername) {
        if (players[playername]) {
          return players[playername];
        } else {
          return (players[playername] = wbcEntryResource.query({playerName: playername}));
        }
      },
      get standing() {
        if (!wbc) {
          return (wbc = wbcEntryResource.query());
        }
        return wbc;
      },
      get graph() {
        if (!graph) {
          return (graph = wbcEntryResource.query({graph:true}));
        }
        return graph;
      },
      get wbc() {
        return wbcResource.get();
      },
      join: function(player) {
        return wbcEntryResource.save({'playerName': player.playername}, function() {
          $rootScope.$broadcast('wbc-joined');
        });
      }
    };

  }]);

