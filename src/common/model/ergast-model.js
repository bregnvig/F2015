'use strict';

angular.module('f2015.model.ergast', ['ngResource'])
  .factory('ergastModel', ['$http', '$resource', 'ENV', function($http, $resource, ENV) {
    function resultTransformResponse(data) {
      const mrData = angular.fromJson(data).MRData;
      return mrData.RaceTable.Races.length ? mrData.RaceTable.Races[0].Results : null;
    }

    function driverTransformResponse(data) {
      const mrData = angular.fromJson(data).MRData;
      return mrData.RaceTable.Races.length ? mrData.RaceTable.Races : null;
    }

    function standingTransformResponse(data) {
      const mrData = angular.fromJson(data).MRData;
      return mrData.StandingsTable.StandingsLists.length ? mrData.StandingsTable.StandingsLists[0].DriverStandings : [];
    }

    const currentSeason = new Date().getFullYear();
    const previousSeason = currentSeason - 1;
    const qualifyResults = {
      'currentSeason': {},
      'previousSeason': {}
    };
    const raceResults = {
      'currentSeason': {},
      'previousSeason': {}
    };
    const resultResource = $resource(`${ENV.ergastEndpoint}/api/f1/:season/circuits/:circuitId/:type.json`,
      {
        season: previousSeason
      },
      {
        'qualify': {
          method: 'get',
          params: { 'type': 'qualifying' },
          isArray: true,
          cache: true,
          transformResponse: [function(data) {
            var mrData = angular.fromJson(data).MRData;
            return mrData.RaceTable.Races.length ? mrData.RaceTable.Races[0].QualifyingResults : null;
          }].concat($http.defaults.transformResponse)
        },
        'results': {
          method: 'get',
          params: { 'type': 'results' },
          isArray: true,
          cache: true,
          transformResponse: [resultTransformResponse].concat($http.defaults.transformResponse)
        }
      });
    const raceResource = $resource(`${ENV.ergastEndpoint}/api/f1/:season/:raceId.json`,
      {
        season: currentSeason
      },
      {
        'race': {
          method: 'get',
          cache: true,
          transformResponse: [function(data) {
            var mrData = angular.fromJson(data).MRData;
            return mrData.RaceTable.Races.length ? mrData.RaceTable.Races[0] : null;
          }].concat($http.defaults.transformResponse)
        },
        'results': {
          method: 'get',
          cache: true,
          url: `${ENV.ergastEndpoint}/api/f1/current/results.json`,
          transformResponse: [resultTransformResponse].concat($http.defaults.transformResponse)
        },
        'standings': {
          method: 'get',
          params: { 'raceId': 'driverStandings' },
          isArray: true,
          cache: true,
          transformResponse: [standingTransformResponse].concat($http.defaults.transformResponse)
        }
      });
    const driverResource = $resource(`${ENV.ergastEndpoint}/api/f1/:season/drivers/:code/:type.json`,
      {
        season: previousSeason
      },
      {
        'qualify': {
          method: 'get',
          isArray: true,
          params: {
            'type': 'qualifying'
          },
          cache: true,
          transformResponse: [driverTransformResponse].concat($http.defaults.transformResponse)
        },
        'results': {
          method: 'get',
          isArray: true,
          params: {
            'type': 'results'
          },
          cache: true,
          transformResponse: [driverTransformResponse].concat($http.defaults.transformResponse)
        },
        'status': {
          method: 'get',
          isArray: true,
          params: {
            'type': 'status'
          },
          cache: true,
          transformResponse: [function(data) {
            var mrData = angular.fromJson(data).MRData;
            return mrData.StatusTable.Status ? mrData.StatusTable.Status : null;
          }].concat($http.defaults.transformResponse)
        }

      });
    return {
      get currentSeason() {
        return currentSeason;
      },
      get previousSeason() {
        return previousSeason;
      },
      next: function(callback) {
        return raceResource.race({ 'raceId': 'next' }, callback);
      },
      getLastSeasonQualify: function(circuitId, callback) {
        if (qualifyResults.previousSeason[circuitId] === undefined) {
          qualifyResults.previousSeason[circuitId] = resultResource.qualify({ 'circuitId': circuitId }, callback);
        } else if (callback) {
          callback(qualifyResults.previousSeason[circuitId]);
        }
        return qualifyResults.previousSeason[circuitId];
      },
      getLastSeasonResults: function(circuitId, callback) {
        if (raceResults.previousSeason[circuitId] === undefined) {
          raceResults.previousSeason[circuitId] = resultResource.results({ 'circuitId': circuitId }, callback);
        } else if (callback) {
          callback(raceResults.previousSeason[circuitId]);
        }
        return raceResults.previousSeason[circuitId];
      },
      getCurrentResults: function(circuitId, callback) {
        if (raceResults.currentSeason[circuitId] === undefined) {
          raceResults.currentSeason[circuitId] = resultResource.results({ 'circuitId': circuitId, 'season': currentSeason }, callback);
        } else if (callback) {
          callback(raceResults.currentSeason[circuitId]);
        }
        return raceResults.currentSeason[circuitId];
      },
      getCurrentQualify: function(circuitId, callback) {
        if (qualifyResults.currentSeason[circuitId] === undefined) {
          qualifyResults.currentSeason[circuitId] = resultResource.qualify({ 'circuitId': circuitId, 'season': currentSeason }, callback);
        } else if (callback) {
          callback(qualifyResults.currentSeason[circuitId]);
        }
        return qualifyResults.currentSeason[circuitId];
      },
      getStandings: function(callback) {
        return raceResource.standings(callback);
      },
      getLastYearDriverQualify: function(code, callback) {
        return driverResource.qualify({ 'code': code }, callback);
      },
      getLastYearDriverResults: function(code, callback) {
        return driverResource.results({ 'code': code }, callback);
      },
      getLastYearDriverStatus: function(code, callback) {
        return driverResource.status({ 'code': code }, callback);
      },
      getCurrentYearDriverQualify: function(code, callback) {
        return driverResource.qualify({ 'code': code, 'season': currentSeason }, callback);
      },
      getCurrentYearDriverResults: function(code, callback) {
        return driverResource.results({ 'code': code, 'season': currentSeason }, callback);
      },
      getCurrentYearDriverStatus: function(code, callback) {
        return driverResource.status({ 'code': code, 'season': currentSeason }, callback);
      }
    };

  }]);
