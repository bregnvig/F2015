'use strict';

angular.module('f2015.account')
  .controller('AccountCtrl', ['accountService', '$mdDialog', function(accountService, $mdDialog) {
    var account = this;
    account.account = accountService;
    account.showTransferInfo = function() {
      $mdDialog.show( {
        templateUrl: 'app/account/transfer-info.tmpl.html'
      });
    };
  }])
  .directive('accountWarningCard', ['accountService', function (accountService) {
    return {
      restrict: 'E',
      templateUrl: 'app/account/account-warning-card.tmpl.html',
      link: function($scope, element) {
        $scope.account = accountService.get;
        $scope.$watch('account', function (newValue) {
          if (newValue && newValue.balance && newValue.balance < 0) {
            element.removeClass('ng-hide');
          } else {
            element.addClass('ng-hide');
          }
        }, true);
      }
    };
  }]);
