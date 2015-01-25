'use strict';

angular.module('f2015.model.race', ['ngResource', 'f2015.authentication', 'config'])
  .factory('raceModel', ['$rootScope', '$resource', 'ENV', 'authenticationService', function($rootScope, $resource, ENV, authenticationService) {

    var raceResource = $resource(ENV.apiEndpoint+'/ws/race/:id');
    var racesResource = $resource(ENV.apiEndpoint+'/ws/races');
    var currentRace;
    var all;

    function getCurrentRace() {
      raceResource.get().$promise.then(function(result) {
        $rootScope.$broadcast('current-race', currentRace = result);
      });
    }

    if (authenticationService.loggedIn) {
      getCurrentRace();
    }

    $rootScope.$on('login-successful', function() {
      getCurrentRace();
      if (all) {
        racesResource.query().$promise.then(function(result) {
          angular.copy(result, all);
        });
      }
    });

    return {
      get current() {
        return currentRace;
      },
      get: function(id) {
        return raceResource.get({id: id});
      },
      get all() {
        if (!all) {
          return (all = (authenticationService.loggedIn ? racesResource.query() : []));
        }
        return all;
      }
    };

  }]);
