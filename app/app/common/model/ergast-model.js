'use strict';

angular.module('f2015.model.ergast', ['ngResource'])
  .factory('ergastModel', ['$http', '$resource', function($http, $resource) {
    function resultTransformResponse(data) {
      var mrData = angular.fromJson(data).MRData;
      return mrData.RaceTable.Races.length ? mrData.RaceTable.Races[0].Results : null;
    }

    var currentSeason = new Date().getFullYear();
    var previousSeason = currentSeason-1;
    var qualifyResults = {
      'currentSeason': {},
      'previousSeason': {}
    };
    var raceResults = {
      'currentSeason': {},
      'previousSeason': {}
    };
    var resultResource = $resource('http://ergast.com/api/f1/:season/circuits/:circuitId/:type.json',
      {
        season: previousSeason
      },
      {
        'qualify': {
          method: 'get',
          params: { 'type': 'qualifying'},
          isArray: true,
          cache: true,
          transformResponse: [function(data) {
            var mrData = angular.fromJson(data).MRData;
            return mrData.RaceTable.Races.length ? mrData.RaceTable.Races[0].QualifyingResults : null;
          }].concat($http.defaults.transformResponse)
        },
        'results': {
          method: 'get',
          params: { 'type': 'results'},
          isArray: true,
          cache: true,
          transformResponse: [resultTransformResponse].concat($http.defaults.transformResponse)
        }
      });
    var raceResource = $resource('http://ergast.com/api/f1/:season/:raceId.json',
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
          url: 'http://ergast.com/api/f1/current/results.json',
          transformResponse: [resultTransformResponse].concat($http.defaults.transformResponse)
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
        return raceResource.race({'raceId': 'next'}, callback);
      },
      getLastSeasonQualify: function(circuitId, callback) {
        if (qualifyResults.previousSeason[circuitId] === undefined) {
          qualifyResults.previousSeason[circuitId] = resultResource.qualify({'circuitId': circuitId}, callback);
        }
        return qualifyResults.previousSeason[circuitId];
      },
      getLastSeasonResults: function(circuitId, callback) {
        if (raceResults.previousSeason[circuitId] === undefined) {
          raceResults.previousSeason[circuitId] = resultResource.results({'circuitId': circuitId}, callback);
        }
        return raceResults.previousSeason[circuitId];
      },
      getCurrentResults: function(circuitId, callback) {
        if (raceResults.currentSeason[circuitId] === undefined) {
          raceResults.currentSeason[circuitId] = resultResource.results({'circuitId': circuitId, 'season': currentSeason}, callback);
        }
        return raceResults.currentSeason[circuitId];
      },
      getCurrentQualify: function(circuitId, callback) {
        if (qualifyResults.currentSeason[circuitId] === undefined) {
          qualifyResults.currentSeason[circuitId] = resultResource.qualify({'circuitId': circuitId, 'season': currentSeason}, callback);
        }
        return qualifyResults.currentSeason[circuitId];
      }
    };

  }]);
