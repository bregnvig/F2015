'use strict';

angular.module('f2015.model.race', ['f2015.resource', 'f2015.authentication', 'config'])
  .factory('raceModel', ['$rootScope', 'secureResource', 'ENV', function($rootScope, secureResource, ENV) {

    var raceResource = secureResource(ENV.apiEndpoint+'/ws/race/:id');
    var racesResource = secureResource(ENV.apiEndpoint+'/ws/races');
    var currentRace;
    var all;
    var fullRaces = {};

    return {
      get current() {
        return currentRace || (currentRace = raceResource.get());
      },
      get: function(id) {
        if (fullRaces[id]) {
          return fullRaces[id];
        } else {
          return (fullRaces[id] = raceResource.get({id: id}));
        }
      },
      bid: function(id, playername) {
        var race = this.get(id);
        var result = {};
        race.$promise.then(function() {
          race.bids.forEach(function(bid) {
            if (bid.player.playername === playername) {
              angular.copy(bid, result);
              result.driver = race.selectedDriver;
            }
          });
        });
        return result;
      },
      result: function(id) {
        var race = this.get(id);
        var result = {};
        race.$promise.then(function() {
          if (race.raceResult) {
            angular.copy(race.raceResult, result);
            result.driver = race.selectedDriver;
          }
        });
        return result;
      },
      get all() {
        if (!all) {
          return (all = racesResource.query());
        }
        return all;
      }
    };

  }]);
