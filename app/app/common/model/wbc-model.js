'use strict';

angular.module('f2015.model.wbc', ['f2015.resource', 'config'])
  .factory('wbcModel', ['ENV', 'secureResource', function(ENV, secureResource) {
    var wbcResource = secureResource(ENV.apiEndpoint+'/ws/v2/wbc/players/:player');

    var wbc;
    var players = {};
    var graph;

    return {
      get: function(playername) {
        if (players[playername]) {
          return players[playername];
        } else {
          return (players[playername] = wbcResource.query({player: playername}));
        }
      },
      get standing() {
        if (!wbc) {
          return (wbc = wbcResource.query());
        }
        return wbc;
      },
      get graph() {
        if (!graph) {
          return (graph = wbcResource.query({graph:true}));
        }
        return graph;
      }
    };

  }]);

