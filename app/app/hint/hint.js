'use strict';

angular.module('f2015.hint', ['f2015.model.ergast'])
  .directive('lastYear', ['raceModel', 'ergastModel',function(raceModel, ergastModel) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/last-year-card.tmpl.html',
      link: function(scope, element) {
        scope.race = raceModel.current;
        scope.next = ergastModel.next(function(race) {
          if (race !== null) {
              scope.qualify = ergastModel.getLastSeasonQualify(race.Circuit.circuitId, function() {
              scope.results = ergastModel.getLastSeasonResults(race.Circuit.circuitId);
              element.removeClass('ng-hide');
            });
          }
        });
      }
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
  .directive('weatherForecastCard', ['$resource', 'ergastModel', function($resource, ergastModel) {
    var weatherApi = $resource('http://api.openweathermap.org/data/2.5/forecast/daily?cnt=16&mode=json&units=metric&lang=da&APPID=89ad11753c4d9dfd5d597ca8829cb331');

    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/weather-card.tmpl.html',
      link: function(scope, element) {

        ergastModel.next(function(race) {
          var parameters = {'lat': race.Circuit.Location.lat, 'lon': race.Circuit.Location.long};
          var forecasts = [];
          weatherApi.get(parameters, function(weatherData) {
            for(var i = 0; i < weatherData.list.length; i++) {
              if (forecasts.length === 3) {
                forecasts.shift();
              }
              forecasts.push(weatherData.list[i]);
              if (weatherData.list[i].dt.getUTCMonth() === race.date.getUTCMonth() && weatherData.list[i].dt.getUTCDate() === race.date.getUTCDate()) {
                break;
              }
            }
            scope.forecasts = forecasts;
            element.removeClass('ng-hide');

          });
        });

      }
    };

  }]).
  directive('developCard', ['$rootScope', 'ENV', 'raceModel', function($rootScope, ENV, raceModel) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/hint/develop-card.tmpl.html',
      link: function($scope, element) {
        if (ENV.name === 'development') {
          element.removeClass('ng-hide');
          $scope.testIt = function() {
            raceModel.get(114).$promise.then(function(race) {
              $rootScope.$broadcast('current-race', race);
            });
          };
        }
      }
    };
  }]);
