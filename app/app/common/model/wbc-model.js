'use strict';

angular.module('f2015.model.wbc', ['f2015.resource', 'config'])
  .factory('wbcModel', ['ENV', 'secureResource', function(ENV, secureResource) {
    var wbcResource = secureResource(ENV.apiEndpoint+'/ws/v2/wbc/players/:player');

    var wbc;

    return {
      get: function(playername) {
        return wbcResource.query({player: playername});
      },
      get standing() {
        if (!wbc) {
          return (wbc = wbcResource.query());
        }
        return wbc;
      }
    };

  }]);

