'use strict';

angular.module('f2015.home', [])
  .controller('HomeCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {
    $rootScope.$on('$stateNotFound',
      function(event, unfoundState, fromState, fromParams){
        console.log(unfoundState.to); // "lazy.state"
        console.log(unfoundState.toParams); // {a:1, b:2}
        console.log(unfoundState.options); // {inherit:false} + default options
      });

    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams){
        //event.preventDefault();
        // transitionTo() promise will be rejected with
        // a 'transition prevented' error
      })
  }]);
