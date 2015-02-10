'use strict';

angular.module('f2015.authentication')
  .directive('loginCard', ['$mdDialog', 'authenticationService', function ($mdDialog, authenticationService) {
   return {
      restrict: 'E',
      templateUrl: 'app/authentication/login-card.tmpl.html',
      controller: 'LoginCardCtrl as loginCard',
      link: function($scope, element) {
        if (authenticationService.loggedIn) {
          element.addClass('ng-hide');
        }
        $scope.$on('login-successful', function () {
          console.log('Login succeeded');
          element.addClass('ng-hide');
        });
        $scope.$on('login-failed', function () {
          if ($scope.loginCard.userName) {
            $mdDialog.show(
              $mdDialog.alert()
                .title('Kunne ikke logge ind')
                .content('Enten er dit brugernavn eller din adgangskode forkert. Eller måske begge dele!')
                .ariaLabel('Login fejl')
                .ok('OK!')
            );
          }
          element.removeClass('ng-hide');
        });
      }
    };
  }])
  .controller('LoginCardCtrl', ['authenticationService', function(authenticationService) {
    var loginCard = this;
    loginCard.rememberMe = true;
    loginCard.login = function() {
      console.log('Login now', loginCard.userName, loginCard.password);
      authenticationService.login(loginCard.userName, loginCard.password).$promise.then(function() {
        if (loginCard.rememberMe) {
          authenticationService.save();
        }
      });
    };
  }]);
