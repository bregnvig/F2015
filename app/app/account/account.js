'use strict';

angular.module('f2015.account')
  .controller('AccountCtrl', ['account', '$mdDialog', function(account, $mdDialog) {
    var vm = this;
    vm.account = account;
    vm.showTransferInfo = function() {
      $mdDialog.show({
        templateUrl: 'app/account/transfer-info.tmpl.html',
        clickOutsideToClose: true,
        controller: ['$scope', function($scope) {
          $scope.closeTransferInfo = function() {
            $mdDialog.hide();
          };
        }]
      });
    };
  }])
  .directive('accountWarningCard', ['account', function(account) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/account/account-warning-card.tmpl.html',
      controller: ['$scope', function($scope) {
        $scope.account = account;
      }]
    };
  }]);
