'use strict';

angular.module('f2015.account')
  .component('account', {
    templateUrl: 'app/account/account.tmpl.html',
    controller: ['account', '$mdDialog', function(account, $mdDialog) {
      var $ctrl = this;
      $ctrl.account = account;
      $ctrl.showTransferInfo = function() {
        $mdDialog.show({
          templateUrl: 'app/account/transfer-info.tmpl.html',
          clickOutsideToClose: true,
          controllerAs: '$ctrl',
          controller() {
            const $ctrl = this;
            $ctrl.closeTransferInfo = function() {
              $mdDialog.hide();
            };
          }
        });
      };
    }]
  })
  .directive('accountWarningCard', ['account', 'cardShowHide', function(account, cardShowHide) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/account/account-warning-card.tmpl.html',
      controllerAs: '$ctrl',
      controller: [function() {
        const $ctrl = this;
        $ctrl.isVisible = () => account.balance && account.balance < 0;
      }],
      link: cardShowHide
    };
  }]);
