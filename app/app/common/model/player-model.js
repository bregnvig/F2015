'use strict';

angular.module('f2015.model.player', ['ngResource'])
  .factory('Player', ['$window', '$resource', 'ENV', function($window, $resource, ENV) {

    return $resource(ENV.apiEndpoint + '/ws/v2/player/:playerName', {
        'playerName': '@playername'
      },
      {
        'save': {
          params: {
            'playerName': ''
          },
          method: 'POST'
        }
      }
    );
  }]);
