'use strict';

angular.module('f2015.common-filter', [])
  .filter('playerName', [function() {
    return function(player) {
      if (player && player.hasOwnProperty('firstName') && player.hasOwnProperty('lastName')) {
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
  }])
  .filter('raceStatus', [function() {
    return function(race) {
      if (race && race.hasOwnProperty('completed')) {
        if (race.completed) {
          return 'Afsluttet';
        } else if (race.opened) {
          return 'Åbent';
        } else if(race.closed) {
          return 'Afventer resultat';
        } else {
          return 'Lukket';
        }

      }
      return '';
    };

  }]);
