'use strict';

angular.module('f2015.model.ergast', ['ngResource'])
  .factory('ergastModel', ['$http', '$resource', function($http, $resource) {
    function resultTransformResponse(data) {
      var mrData = angular.fromJson(data).MRData;
      return mrData.RaceTable.Races.length ? mrData.RaceTable.Races[0].Results : null;
    }

    var currentSeason = new Date().getFullYear();
    var previousSeason = currentSeason-1;
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
      next: function(callback) {
        return raceResource.race({'raceId': 'next'}, callback);
      },
      getLastSeasonQualify: function(circuitId, callback) {
        return resultResource.qualify({'circuitId': circuitId}, callback);
      },
      getLastSeasonResults: function(circuitId, callback) {
        return resultResource.results({'circuitId': circuitId}, callback);
      },
      getCurrentResults: function(circuitId, callback) {
        return resultResource.results({'circuitId': circuitId, 'season': currentSeason}, callback);
      },
      getCurrentQualify: function(circuitId, callback) {
        return resultResource.qualify({'circuitId': circuitId, 'season': currentSeason}, callback);
      }
    };

  }]);
