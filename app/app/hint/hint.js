'use strict';

angular.module('f2015.hint', ['f2015.model.ergast'])
  .directive('lastYear', ['raceModel', 'ergastModel', function(raceModel, ergastModel) {
    return {
      restrict: 'E',
      scope: {},
      replace: true,
      templateUrl: 'app/hint/last-year-card.tmpl.html',
      controllerAs: 'lastyearCtrl',
      controller: function() {
        var vm = this;
        vm.race = raceModel.current;
        vm.next = ergastModel.next(function(race) {
          if (race !== null) {
            vm.qualify = ergastModel.getLastSeasonQualify(race.Circuit.circuitId);
            vm.qualify.$promise.then(function() {
              vm.results = ergastModel.getLastSeasonResults(race.Circuit.circuitId);
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
  .directive('weatherForecastCard', ['$resource', 'raceModel', 'ergastModel', function($resource, raceModel, ergastModel) {
    var weatherApi = $resource('http://api.openweathermap.org/data/2.5/forecast/daily?cnt=16&mode=json&units=metric&lang=da&APPID=89ad11753c4d9dfd5d597ca8829cb331');

    return {
      restrict: 'E',
      scope: {},
      replace: true,
      templateUrl: 'app/hint/weather-card.tmpl.html',
      controllerAs: 'weatherCtrl',
      controller: function() {
        var vm = this;

        ergastModel.next(function(race) {
          var parameters = {
            'lat': race.Circuit.Location.lat,
            'lon': race.Circuit.Location.long
          };
          var forecasts = [];
          weatherApi.get(parameters, function(weatherData) {
            for (var i = 0; i < weatherData.list.length; i++) {
              if (forecasts.length === 3) {
                forecasts.shift();
              }
              forecasts.push(weatherData.list[i]);
              if (weatherData.list[i].dt.getUTCMonth() === race.date.getUTCMonth() && weatherData.list[i].dt.getUTCDate() === race.date.getUTCDate()) {
                break;
              }
            }
            vm.race = raceModel.current;
            vm.forecasts = forecasts;
          });
        });

      }
    };

  }])
  .directive('alreadyParticipated', [function() {

    return {
      restrict: 'E',
      scope: {},
      controllerAs: 'alreadyParticipatedCtrl',
      templateUrl: 'app/hint/already-participated-card.tmpl.html',
      controller: ['raceModel', function(raceModel) {
        var vm = this;
        raceModel.current.$promise.then(function() {
          vm.race = raceModel.get(raceModel.current.id);
        });
      }]
    };

  }])
  .directive('lastRace', ['credentials', function(credentialsProvider) {

    return {
      restrict: 'E',
      scope: {},
      replace: true,
      controllerAs: 'lastRaceCtrl',
      templateUrl: 'app/hint/last-race-card.tmpl.html',
      controller: ['raceModel', function(raceModel) {
        var vm = this;
        vm.currentRace = raceModel.current;
        vm.race = raceModel.get('previous');
        vm.race.$promise.then(function(race) {
          credentialsProvider().then(function(credentials) {
            race.bids.forEach(function(bid, index) {
              if (bid.player.playername === credentials.playername) {
                vm.yourPosition = index + 1;
              }
            });
          })
        });
      }]
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
            raceModel.get(114).$promise.then(function(race) {
              $rootScope.$broadcast('current-race', race);
            });
          };
        }
      }
    };
  }]);
