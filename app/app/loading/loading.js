'use strict';

angular.module('f2015.loading', [])
  .directive('loading', [function() {

    return {
      restrict: 'E',
      templateUrl: 'app/loading/loading.tmpl.html',
      link: function($scope, element) {

        element.addClass('ng-hide');

        $scope.$on('f2015-timer', function(event, show) {
          if (show) {
            element.removeClass('ng-hide');
          } else {
            element.addClass('ng-hide');
          }
        });
      }
    };
  }])
  .factory('loadingState', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    var outstanding = 0;
    var timer;

    return {
      ajaxStarted: function() {
        if (outstanding === 0) {
          timer = $timeout(function() {
            $rootScope.$broadcast('f2015-timer', true);
          }, 500);
        }
        outstanding++;
      },
      ajaxCompleted: function() {
        outstanding--;
        if (outstanding === 0) {
          $timeout.cancel(timer);
          $rootScope.$broadcast('f2015-timer', false);
        }
      },
      get running() {
        return outstanding !== 0;
      }
    };
  }])
  .factory('loadingInterceptor', ['$q', 'loadingState', function($q, loadingState) {

    return {
      // optional method
      'request': function(config) {
        loadingState.ajaxStarted();
        return config;
      },

      // optional method
      'requestError': function(rejection) {
        loadingState.ajaxCompleted();
        return $q.reject(rejection);
      },

      // optional method
      'response': function(response) {
        loadingState.ajaxCompleted();
        return response;
      },

      // optional method
      'responseError': function(rejection) {
        loadingState.ajaxCompleted();
        return $q.reject(rejection);
      }
    };
  }]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('loadingInterceptor');
  }]);
