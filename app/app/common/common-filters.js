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
        if (player.lastYearWBC) {
          result = '<i class="fa fa-trophy lastYearWBC-' + player.lastYearWBC + '"></i> ' + result;
          switch (player.lastYearWBC) {
            case 1:
              break;
          }
        }
        return result;
      }
      return player ? player.toSource() : '';
    };
  }])
  .filter('noTrophy', [function() {
    return function(text) {
      return text.replace(/^<i.*fa-trophy.*<\/i> /, '');
    };

  }])
  .filter('raceStatus', [function() {
    return function(race) {
      if (race && race.hasOwnProperty('completed')) {
        if (race.completed) {
          return 'Afsluttet';
        } else if (race.opened) {
          return 'Lukker';
        } else if(race.closed) {
          return 'Afventer resultat';
        } else {
          return 'Ikke åbent endnu';
        }

      }
      return '';
    };

  }]);
