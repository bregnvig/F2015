'use strict';

angular.module('f2015.model.race', ['f2015.authentication', 'config'])
  .factory('raceModel', ['$rootScope', '$resource', 'ENV', 'credentials', function($rootScope, $resource, ENV, credentials) {

    const insecureRaceResource = $resource(ENV.apiEndpoint + '/ws/race', null, {
      'get': {
        noAuthorization: true
      }
    });
    const raceResource = $resource(ENV.apiEndpoint + '/ws/race/:id');
    const bidResource = $resource(ENV.apiEndpoint + '/ws/bid');
    const racesResource = $resource(ENV.apiEndpoint + '/ws/races');
    let currentRace = insecureRaceResource.get();
    let currentBids;
    let all;
    let fullRaces = {};

    credentials().then(() => {
      currentRace = raceResource.get();
    });

    return {
      get current() {
        return currentRace;
      },
      get currentBids() {
        return currentBids || (currentBids = raceResource.get({ 'players': true }));
      },
      get: function(id) {
        if (fullRaces[id]) {
          return fullRaces[id];
        } else {
          return (fullRaces[id] = raceResource.get({ id: id }));
        }
      },
      submitBid: function(bid, callback) {
        bidResource.save(null, bid, callback).$promise.then(function() {
          $rootScope.$broadcast('bid-submitted');
          fullRaces = {};
          currentRace = undefined;
        });
      },
      submitIntermediate: function(race, result, callback) {
        return raceResource.save({ 'id': race.id, 'intermediate': true }, result, callback);
      },
      submitResult: function(race, result, callback) {
        var data = angular.copy(result);
        delete data.polePositionTimeInText;
        delete data.driver;
        raceResource.save({ 'id': race.id }, data, callback).$promise.then(function() {
          fullRaces = {};
          all = undefined;
        });
      },
      rollback: function(race, callback) {
        raceResource.delete({ 'id': race.id }, undefined, callback).$promise.then(function() {
          fullRaces = {};
          all = undefined;
        });
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
