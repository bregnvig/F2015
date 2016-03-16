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

    credentials().then(() => currentRace = null);

    return {
      get current() {
        if (!currentRace) {
          currentRace = raceResource.get();
        }
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
        bidResource.save(null, bid, callback).$promise.then(() => {
          $rootScope.$broadcast('bid-submitted');
          fullRaces = {};
          currentRace = undefined;
        });
      },
      submitIntermediate: function(race, result, callback) {
        return raceResource.save({ 'id': race.id, 'intermediate': true }, result, callback);
      },
      submitResult: function(race, result, callback) {
        const data = angular.copy(result);
        data.polePositionTimeInText = undefined;
        data.driver = undefined;
        raceResource.save({ 'id': race.id }, data, callback).$promise.then(() => {
          fullRaces = {};
          all = undefined;
        });
      },
      rollback: function(race, callback) {
        raceResource.delete({ 'id': race.id }, undefined, callback).$promise.then(() => {
          fullRaces = {};
          all = undefined;
        });
      },
      bid: function(id, playername) {
        const race = this.get(id);
        const result = {};
        race.$promise.then(() => {
          race.bids.forEach((bid) => {
            if (bid.player.playername === playername) {
              angular.copy(bid, result);
              result.driver = race.selectedDriver;
            }
          });
        });
        return result;
      },
      result: function(id) {
        const race = this.get(id);
        const result = {};
        race.$promise.then(() => {
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
