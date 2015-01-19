'use strict';

angular
  .module('f2015', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngMaterial',
    'config',
    'ngTouch',
    'ui.router',
    'f2015.home',
    'f2015.header',
    'f2015.authentication'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryColor('light-blue')
      .accentColor('orange');

    $stateProvider
      .state('f2015', {
        url: '/',
        templateUrl: 'app/home/home.tmpl.html',
        controller: 'HomeCtrl'
      });
    $urlRouterProvider.otherwise('/');
  }]);
