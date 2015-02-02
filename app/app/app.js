'use strict';

angular
  .module('f2015', [
    'ngAnimate',
    'ngResource',
    'ngMaterial',
    'angularMoment',
    'config',
    'ui.router',
    'f2015.home',
    'f2015.common-filter',
    'f2015.common-directive',
    'f2015.model.race',
    'f2015.model.wbc',
    'f2015.header',
    'f2015.account',
    'f2015.race',
    'f2015.wbc',
    'f2015.loading',
    'f2015.authentication'
  ])
  .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$httpProvider', function($locationProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider) {

    //$locationProvider.html5Mode(true);

    $mdThemingProvider.theme('default')
      .primaryColor('blue')
      .accentColor('deep-orange');

    $stateProvider
      .state('f2015', {
        url: '/',
        templateUrl: 'app/home/home.tmpl.html'
      })
      .state('account', {
        url: '/account',
        templateUrl: 'app/account/account.tmpl.html',
        controller: 'AccountCtrl as account'
      })
      .state('races', {
        url: '/race',
        templateUrl: 'app/race/races.tmpl.html',
        controller: 'RacesCtrl as races'
      })
      .state('race', {
        url: '/race/:id',
        templateUrl: 'app/race/race.tmpl.html',
        controller: 'RaceCtrl as race'
      })
      .state('bid', {
        url: '/race/:id/:player',
        templateUrl: 'app/race/bid.tmpl.html',
        controller: 'BidCtrl as bid'
      })
      .state('result', {
        url: '/result/:id',
        templateUrl: 'app/race/bid.tmpl.html',
        controller: 'ResultCtrl as bid'
      })
      .state('wbc', {
        url: '/wbc',
        templateUrl: 'app/wbc/wbc.tmpl.html',
        controller: 'WbcCtrl as wbc'
      })
      .state('wbc-player', {
        url: '/wbc/:player',
        templateUrl: 'app/wbc/player.tmpl.html',
        controller: 'WbcPlayerCtrl as wbcPlayer'
      })
      .state('rules', {
        url: '/rules',
        templateUrl: 'app/rules/rules.tmpl.html'
      });

    $urlRouterProvider.otherwise('/');

    var regexMilliseconds = /^\d{10}000$/;
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
        } else if (typeof value === 'object') {
          convertDateMillisecondsToDates(value);
        }
      }
    }
    $httpProvider.defaults.transformResponse.push(function(responseData){
      convertDateMillisecondsToDates(responseData);
      return responseData;
    });
    $httpProvider.interceptors.push('loadingMonitor');
  }])
  .run(['amMoment', function(amMoment) {
    amMoment.changeLocale('da');
  }]);
