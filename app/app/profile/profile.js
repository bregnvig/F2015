'use strict';

angular.module('f2015.profile', ['ngMaterial', 'ngMessages', 'f2015.authentication', 'f2015.resource', 'f2015.loading'])
  .controller('ProfileCtrl', ['$scope', '$mdToast', 'authenticationService', 'loadingState' , 'profileResource', function($scope, $mdToast, authenticationService, loadingState, profileResource) {
    var profile = this;
    profile.running = loadingState.running;
    profile.user =  authenticationService.credentials;
    $scope.$on('login-successful', function (event, credentials) {
      profile.user = credentials;
    });
    profile.update = function() {
      profileResource.updateProfile().$promise.then(function() {
        $mdToast.show($mdToast.simple()
            .content('Profil opdateret!')
        );
      });
    };
  }])
  .controller('PasswordCtrl', ['$scope', '$mdToast', 'authenticationService', 'profileResource', function($scope, $mdToast, authenticationService, profileResource) {
    var password = this;
    password.update = function() {
      profileResource.updatePassword($scope.password.first).$promise.then(function() {
        $mdToast.show($mdToast.simple()
            .content('Adgangskode opdateret!')
        );
      });
    };
  }])
  .factory('profileResource', ['ENV', 'secureResource', 'authenticationService', function(ENV, secureResource, authenticationService) {
    var profileResource = secureResource(ENV.apiEndpoint + '/ws/player/:playerName', null,
      {
        'update': {
          'method': 'put'
        }
      });
    var passwordResource = secureResource(ENV.apiEndpoint + '/ws/player/:playerName/password', null,
      {
        'update': {
          'method': 'put'
        }
      });
    return {
      updateProfile: function() {
        var result = profileResource.update({playerName: authenticationService.credentials.playername}, authenticationService.credentials);
        return result;
      },
      updatePassword: function(password) {
        var result = passwordResource.update({playerName: authenticationService.credentials.playername}, {password: password});
        return result;
      }
    };

  }])
  .directive('equals', function() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, elem, attrs, ngModel) {
        if(!ngModel) {
          console.log('No model - ejecting');
          return;
        }

        // watch own value and re-validate on change
        scope.$watch(attrs.ngModel, function() {
          validate();
        });

        // observe the other value and re-validate on change
        attrs.$observe('equals', function () {
          validate();
        });

        var validate = function() {
          // values
          var val1 = ngModel.$viewValue;
          var val2 = attrs.equals;

          // set validity
          ngModel.$setValidity('equals', ! val1 || ! val2 || val1 === val2);
        };
      }
    };
  });
