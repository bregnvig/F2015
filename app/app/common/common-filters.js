'use strict';

angular.module('f2015.common-filter', [])
  .filter('playerName', [function() {
    return function(player) {
      if (player.hasOwnProperty('firstName') && player.hasOwnProperty('lastName')) {
        var result = player.firstName || '';
        if (result.length > 0) {
          result += ' ';
        }
        if (player.lastName) {
          result += player.lastName;
        }
        return result;
      }
      return player ? player.toSource() : '';
    };
  }]);
