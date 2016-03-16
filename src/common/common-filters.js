'use strict';

angular.module('f2015.common-filter', [])
  .filter('playerName', ['authenticationService', function() {
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
          result = '<i title="' + player.lastYearWBC + '. plads i sidste års WBC" class="fa fa-trophy lastYearWBC-' + player.lastYearWBC + '"></i> ' + result;
        }
        if (player.wbcParticipant) {
          result += ' <i title="Deltager i WBC" class="fa fa-star-o"></i>';
        }
        return result;
      }
      return player ? player.toSource() : '';
    };
  }])
  .filter('noTrophy', [function() {
    return function(text) {
      return text.replace(/^<i.*fa-trophy.*<\/i> /, '').replace(/ <i.*fa-star-o.*<\/i>$/, '');
    };

  }])
  .filter('raceStatus', [function() {
    return function(race) {
      if (race && race.hasOwnProperty('completed')) {
        if (race.completed) {
          return 'Afsluttet';
        } else if (race.opened) {
          return 'Lukker';
        } else if (race.closed) {
          return 'Afventer resultat';
        } else {
          return 'Åbner ';
        }

      }
      return '';
    };

  }])
  .filter('ergastDriverName', [function() {
    return function(driver) {
      if (driver && driver.driverId) {
        return driver.givenName + ' ' + driver.familyName;
      }
      return driver;
    };

  }])
  .filter('ergastQualifyTime', [function() {
    return function(result) {
      if (result && result.Q1) {
        if (result.Q3) {
          return 'Q3 - ' + result.Q3;
        } else if (result.Q2) {
          return 'Q2 - ' + result.Q2;
        }
        return 'Q1 - ' + result.Q1;
      }
      return '';
    };

  }]);
