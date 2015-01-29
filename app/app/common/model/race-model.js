'use strict';

angular.module('f2015.model.race', ['f2015.resource', 'f2015.authentication', 'config'])
  .factory('raceModel', ['$rootScope', 'secureResource', 'ENV', function($rootScope, secureResource, ENV) {

    var raceResource = secureResource(ENV.apiEndpoint+'/ws/race/:id');
    var racesResource = secureResource(ENV.apiEndpoint+'/ws/races');
    var currentRace;
    var all;

    return {
      get current() {
        return currentRace || (currentRace = raceResource.get());
      },
      get: function(id) {
        return raceResource.get({id: id});
      },
      get all() {
        if (!all) {
          return (all = racesResource.query());
        }
        return all;
      }
    };

  }]);
