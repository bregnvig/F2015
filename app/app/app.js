'use strict';

angular
  .module('f2015', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngMaterial',
    'angularMoment',
    'config',
    'ui.router',
    'f2015.home',
    'f2015.model.race',
    'f2015.header',
    'f2015.account',
    'f2015.race',
    'f2015.authentication'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider) {

    $mdThemingProvider.theme('default')
      .primaryColor('blue')
      .accentColor('orange');

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
  }])
  .run(['amMoment', function(amMoment) {
    amMoment.changeLocale('da');
  }]);
