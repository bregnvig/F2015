'use strict';

angular.module('f2015.hint', ['f2015.model.ergast'])
  .directive('lastYear', ['raceModel', 'ergastModel', 'cardShowHide', function(raceModel, ergastModel, cardShowHide) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/last-year-card.tmpl.html',
      controllerAs: '$ctrl',
      controller() {
        var $ctrl = this;
        $ctrl.race = raceModel.current;
        $ctrl.next = ergastModel.next((race) => {
          if (race !== null) {
            $ctrl.qualify = ergastModel.getLastSeasonQualify(race.Circuit.circuitId);
            $ctrl.qualify.$promise.then(() => $ctrl.results = ergastModel.getLastSeasonResults(race.Circuit.circuitId));
          }
        });
        $ctrl.isVisible = () => $ctrl.qualify && $ctrl.qualify[0];
      },
      link: cardShowHide
    };

  }])
  .filter('driverName', [function() {
    return function(driver) {
      if (driver && driver.givenName) {
        return driver.familyName;
      }
      return '';
    };
  }])
  .directive('weatherForecastCard', ['$resource', 'raceModel', 'ergastModel', 'cardShowHide', function($resource, raceModel, ergastModel, cardShowHide) {
    var weatherApi = $resource('http://api.openweathermap.org/data/2.5/forecast/daily?cnt=16&mode=json&units=metric&lang=da&APPID=89ad11753c4d9dfd5d597ca8829cb331');

    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/weather-card.tmpl.html',
      controllerAs: '$ctrl',
      controller() {
        const $ctrl = this;

        ergastModel.next((race) => {
          const parameters = {
            'lat': race.Circuit.Location.lat,
            'lon': race.Circuit.Location.long
          };
          const forecasts = [];
          weatherApi.get(parameters, (weatherData) => {
            for (let i = 0; i < weatherData.list.length; i++) {
              if (forecasts.length === 3) {
                forecasts.shift();
              }
              forecasts.push(weatherData.list[i]);
              if (weatherData.list[i].dt.getUTCMonth() === race.date.getUTCMonth() && weatherData.list[i].dt.getUTCDate() === race.date.getUTCDate()) {
                break;
              }
            }
            $ctrl.race = raceModel.current;
            $ctrl.forecasts = forecasts;
          });
        });
        $ctrl.isVisible = () => $ctrl.forecasts && $ctrl.race;
      },
      link: cardShowHide
    };

  }])
  .directive('alreadyParticipated', ['cardShowHide', function(cardShowHide) {

    return {
      restrict: 'E',
      scope: {},
      controllerAs: '$ctrl',
      templateUrl: 'app/hint/already-participated-card.tmpl.html',
      controller: ['raceModel', function(raceModel) {
        var $ctrl = this;
        raceModel.current.$promise.then(() => {
          $ctrl.race = raceModel.get(raceModel.current.id);
        });
        $ctrl.isVisible = () => $ctrl.race && $ctrl.race.participant;
      }],
      link: cardShowHide
    };

  }])
  .directive('lastRace', ['cardShowHide', function(cardShowHide) {
    return {
      templateUrl: 'app/hint/last-race-card.tmpl.html',
      restrict: 'E',
      scope: {},
      controllerAs: '$ctrl',
      controller: ['credentials', 'raceModel', function(credentialsProvider, raceModel) {
        const $ctrl = this;
        $ctrl.currentRace = raceModel.current;
        $ctrl.race = raceModel.get('previous');
        $ctrl.race.$promise.then((race) => {
          credentialsProvider().then((credentials) => {
            race.bids.forEach((bid, index) => {
              if (bid.player.playername === credentials.playername) {
                $ctrl.yourPosition = index + 1;
              }
            });
          });
        });
        $ctrl.isVisible = () => $ctrl.race.name && !$ctrl.currentRace.closed;
      }],
      link: cardShowHide
    };
  }])
  .directive('developCard', ['$rootScope', 'ENV', 'raceModel', function($rootScope, ENV, raceModel) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/develop-card.tmpl.html',
      link: function($scope) {
        if (ENV.name === 'development') {
          // element.removeClass('ng-hide');
          $scope.testIt = function() {
          };
        }
      }
    };
  }]);
