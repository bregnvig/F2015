'use strict';

angular.module('f2015.profile', ['ngMaterial', 'ngMessages', 'f2015.authentication', 'f2015.loading'])
  .controller('ProfileCtrl', ['$scope', '$mdToast', 'credentials', 'loadingState', 'authenticationService', function($scope, $mdToast, credentialsProvider, loadingState, authenticationService) {
    var vm = this;
    vm.running = loadingState.running;
    credentialsProvider().then(function(credentials) {
      vm.user = credentials;
    });
    vm.update = function() {
      vm.user.$save().then(function() {
        authenticationService.save();
        $mdToast.show($mdToast.simple()
            .content('Profil opdateret!')
        );
      });
    };
  }])
  .controller('PasswordCtrl', ['$scope', '$mdToast', 'profileResource', function($scope, $mdToast, profileResource) {
    var password = this;
    password.update = function() {
      profileResource.updatePassword($scope.password.first).then(function() {
        $mdToast.show($mdToast.simple()
            .content('Adgangskode opdateret!')
        );
      });
    };
  }])
  .factory('profileResource', ['$resource', 'ENV', 'credentials', function($resource, ENV, credentialsProvider) {
    var passwordResource = $resource(ENV.apiEndpoint + '/ws/player/:playerName/password', null,
      {
        'update': {
          'method': 'put'
        }
      });
    return {
      updatePassword: function(password) {
        return credentialsProvider().then(function(credentials) {
          var result = passwordResource.update({
            playerName: credentials.playername
          }, {
            password: password
          });
          return result;
        });
      }
    };

  }])
  .directive('equals', function() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, elem, attrs, ngModel) {
        if (!ngModel) {
          console.log('No model - ejecting');
          return;
        }

        // watch own value and re-validate on change
        scope.$watch(attrs.ngModel, function() {
          validate();
        });

        // observe the other value and re-validate on change
        attrs.$observe('equals', function() {
          validate();
        });

        var validate = function() {
          // values
          var val1 = ngModel.$viewValue;
          var val2 = attrs.equals;

          // set validity
          ngModel.$setValidity('equals', !val1 || !val2 || val1 === val2);
        };
      }
    };
  });
