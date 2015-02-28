'use strict';

angular
  .module('f2015', [
    'ngAnimate',
    'ngResource',
    'ngMaterial',
    'ngSanitize',
    'angularMoment',
    'config',
    'ui.router',
    'f2015.home',
    'f2015.constants',
    'f2015.common-filter',
    'f2015.common-directive',
    'f2015.model.race',
    'f2015.model.driver',
    'f2015.model.wbc',
    'f2015.header',
    'f2015.account',
    'f2015.race',
    'f2015.wbc',
    'f2015.profile',
    'f2015.loading',
    'f2015.hint',
    'f2015.hint.afterQualify',
    'f2015.authentication'
  ])
  .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$httpProvider', function($locationProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider) {

    //$locationProvider.html5Mode(true);

    $mdThemingProvider.theme('default')
      .primaryPalette('light-green')
      .accentPalette('orange');

    $stateProvider
      .state('f2015', {
        abstract: true,
        views: {
          header: {
            templateUrl: 'app/header/header.tmpl.html',
            controller: 'HeaderCtrl as header'
          },
          menu: {
            templateUrl: 'app/header/menu.tmpl.html',
            controller: 'MenuCtrl as menu'
          }
        }
      })
      .state('f2015.home', {
        url: '/',
        views: {
          '@': {
            templateUrl: 'app/home/home.tmpl.html',
            controller: 'HomeCtrl'
          }
        }
      })
      .state('f2015.account', {
        url: '/account',
        views: {
          '@': {
            templateUrl: 'app/account/account.tmpl.html',
            controller: 'AccountCtrl as account'
          }
        }
      })
      .state('f2015.races', {
        url: '/race',
        views: {
          '@': {
            templateUrl: 'app/race/races.tmpl.html',
            controller: 'RacesCtrl as races'
          }
        }
      })
      .state('f2015.old-race', {
        url: '/race/last-year',
        cache: false,
        views: {
          '@': {
            templateUrl: 'app/race/old-race.tmpl.html',
            controller: 'OldRaceCtrl as oldRace'
          }
        }
      })
      .state('f2015.race', {
        url: '/race/:id',
        cache: false,
        resolve: {
          currentRace: ['$stateParams', 'raceModel', function($stateParams, raceModel) {
            return raceModel.get($stateParams.id);
          }]
        },
        views: {
          '@': {
            templateUrl: 'app/race/race.tmpl.html',
            controller: 'RaceCtrl as race'
          }
        }
      })
      .state('f2015.race.enter-bid', {
        url: '/enter-bid',
        resolve: {
          drivers: ['driverModel', function(driverModel) {
            return driverModel.drivers;
          }]
        },
        views: {
          '@': {
            templateUrl: 'app/race/enter-bid.tmpl.html',
            controller: 'EnterBidCtrl as enterBid'
          }
        }
      })
      .state('f2015.race.bid', {
        url: '/:player',
        views: {
          '@': {
            templateUrl: 'app/race/bid.tmpl.html',
            controller: 'BidCtrl as bid'
          }
        }
      })
      .state('f2015.race.result', {
        url: '/result',
        views: {
          '@': {
            templateUrl: 'app/race/bid.tmpl.html',
            controller: 'ResultCtrl as bid'
          }
        }
      })
      .state('f2015.race.create-result', {
        url: '/create-result',
        views: {
          '@': {
            templateUrl: 'app/race/bid.tmpl.html',
            controller: 'CreateResultCtrl as bid'
          }
        }
      })
      .state('f2015.wbc', {
        url: '/wbc',
        views: {
          '@': {
            templateUrl: 'app/wbc/wbc.tmpl.html',
            controller: 'WbcCtrl as wbc'
          }
        }
      })
      .state('f2015.wbc.player', {
        url: '/player/:player',
        views: {
          '@': {
            templateUrl: 'app/wbc/player.tmpl.html',
            controller: 'WbcPlayerCtrl as wbcPlayer'
          }
        }
      })
      .state('f2015.wbc.graph', {
        url: '/graph',
        views: {
          '@': {
            templateUrl: 'app/wbc/wbc-graph.tmpl.html',
            controller: 'WbcGraphCtrl as wbcGraph'
          }
        }
      })
      .state('f2015.rules', {
        url: '/rules',
        views: {
          '@': {
            templateUrl: 'app/rules/rules.tmpl.html'
          }
        }
      })
      .state('f2015.password', {
        url: '/password',
        views: {
          '@': {
            templateUrl: 'app/profile/password.tmpl.html',
            controller: 'PasswordCtrl as password'
          }
        }
      })
      .state('f2015.profile', {
        url: '/profile',
        views: {
          '@': {
            templateUrl: 'app/profile/profile.tmpl.html',
            controller: 'ProfileCtrl as profile'
          }
        }
      });

    $urlRouterProvider.otherwise('/');

    var regexMilliseconds = /^\d{10}000$/;
    var regexUnixTime = /^\d{8}00$/;
    var regexISO = /^20\d{2}-\d{2}-\d{2}$/;
    function convertDateMillisecondsToDates(input) {
      // Ignore things that aren't objects.
      if (typeof input !== 'object') {
        return input;
      }
      for (var key in input) {
        if (!input.hasOwnProperty(key)) {
          continue;
        }
        var value = input[key];
        // Check for string properties which look like dates.
        if (typeof value === 'number' && (value).toString().match(regexMilliseconds)) {
           input[key] = new Date(value);
        } else if(typeof value === 'number' && (value).toString().match(regexUnixTime)) {
          input[key] = new Date(value*1000);
        } else if(typeof value === 'string' && (value).toString().match(regexISO)) {
          input[key] = new Date(value);
        } else if (typeof value === 'object') {
          convertDateMillisecondsToDates(value);
        }
      }
    }
    $httpProvider.defaults.transformResponse.push(function(responseData){
      convertDateMillisecondsToDates(responseData);
      return responseData;
    });
  }])
  .run(['amMoment', function(amMoment) {
    //amMoment.changeLocale('da');
  }]);
