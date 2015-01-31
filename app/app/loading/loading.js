'use strict';

angular.module('f2015.loading', [])
  .directive('loading', [function() {

    return {
      restrict: 'E',
      templateUrl: 'app/loading/loading.tmpl.html',
      link: function($scope, element) {

        element.addClass('ng-hide');

        $scope.$on('f2015-timer', function (event, show) {
          if (show) {
            element.removeClass('ng-hide');
          } else {
            element.addClass('ng-hide');
          }
        });
      }
    };

  }])
  .factory('loadingMonitor', ['$rootScope', '$timeout', '$q', function($rootScope, $timeout, $q){
    var outstanding = 0;
    var timer;

    function ajaxCompleted() {
      outstanding--;
      if (outstanding === 0) {
        $timeout.cancel(timer);
        $rootScope.$broadcast('f2015-timer', false);
      }
    }

    function ajaxStarted() {
      if (outstanding === 0) {
        timer = $timeout(function() {
          $rootScope.$broadcast('f2015-timer', true);
        }, 500);
      }
      outstanding++;
    }

    return {
      // optional method
      'request': function(config) {
        ajaxStarted();
        return config;
      },

      // optional method
      'requestError': function(rejection) {
        ajaxCompleted();
        return $q.reject(rejection);
      },

      // optional method
      'response': function(response) {
        ajaxCompleted();
        return response;
      },

      // optional method
      'responseError': function(rejection) {
        ajaxCompleted();
        return $q.reject(rejection);
      }
    };
  }]);
