'use strict';

angular.module('f2015.model.wbc', ['ngResource', 'config'])
  .factory('wbcModel', ['$rootScope', '$resource', 'ENV', function($rootScope, $resource, ENV) {
    const wbcEntryResource = $resource(ENV.apiEndpoint+'/ws/v2/wbc/players/:playerName', {
      playerName: '@playerName'
    });
    const wbcResource = $resource(ENV.apiEndpoint+'/ws/v2/wbc');
    const players = {};

    let wbc;
    let graph;

    return {
      get: (playername) => {
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
        return wbcEntryResource.save({'playerName': player.playername}, () =>$rootScope.$broadcast('wbc-joined'));
      }
    };

  }]);

