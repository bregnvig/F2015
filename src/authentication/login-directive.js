'use strict';

angular.module('f2015.authentication')
  .directive('loginCard', ['$mdDialog', 'credentials', 'cardShowHide', function($mdDialog, credentialsProvider, cardShowHide) {
    return {
      restrict: 'E',
      templateUrl: 'app/authentication/login-card.tmpl.html',
      scope: {},
      controllerAs: '$ctrl',
      controller: ['authenticationService', function(authenticationService) {
        const $ctrl = this;

        $ctrl.rememberMe = true;
        $ctrl.login = () => {
          console.log('Login now', $ctrl.userName);
          authenticationService.login($ctrl.userName, $ctrl.password).$promise.then(() => {
            if ($ctrl.rememberMe) {
              authenticationService.save();
            }
          }, () => {
            $mdDialog.show(
              $mdDialog.alert()
                .title('Kunne ikke logge ind')
                .textContent('Enten er dit brugernavn eller din adgangskode forkert. Eller måske begge dele!')
                .ariaLabel('Login fejl')
                .ok('OK!')
            );
          });
        };
        credentialsProvider().then(() => $ctrl.loggedIn = true);
        $ctrl.isVisible = () => !$ctrl.loggedIn;
      }],
      link: cardShowHide
    };
  }]);
