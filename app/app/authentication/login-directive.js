'use strict';

angular.module('f2015.authentication')
  .directive('loginCard', ['$mdDialog', 'credentials', function($mdDialog, credentials) {
    return {
      restrict: 'E',
      templateUrl: 'app/authentication/login-card.tmpl.html',
      scope: {},
      replace: true,
      controllerAs: 'loginCardCtrl',
      controller: ['$scope', 'authenticationService', function($scope, authenticationService) {
        var vm = this;
        vm.rememberMe = true;
        vm.login = function() {
          console.log('Login now', vm.userName);
          authenticationService.login(vm.userName, vm.password).$promise.then(function() {
            if (vm.rememberMe) {
              authenticationService.save();
            }
          }, function() {
            $mdDialog.show(
              $mdDialog.alert()
                .title('Kunne ikke logge ind')
                .content('Enten er dit brugernavn eller din adgangskode forkert. Eller måske begge dele!')
                .ariaLabel('Login fejl')
                .ok('OK!')
            );
          });
        };
        credentials().then(function() {
          vm.loggedIn = true;
        });
      }]
    };
  }]);
