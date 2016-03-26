'use strict';

angular
  .module('f2015.account')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('f2015.account', {
        url: '/account/:playerName',
        views: {
          '@': {
            template: '<account></account>'
          }
        }
      })
      .state('f2015.accounts', {
        url: '/accounts',
        views: {
          '@': {
            template: '<accounts></accounts>'
          }
        }
      });
  }])
  .component('account', {
    templateUrl: 'app/account/account.tmpl.html',
    controller: ['Account', 'Player', 'account', '$mdDialog', '$stateParams', function(Account, Player, account, $mdDialog, $stateParams) {
      var $ctrl = this;
      if ($stateParams.playerName) {
        $ctrl.account = Account.get({
          playerName: $stateParams.playerName
        });
        $ctrl.account.playerName = $stateParams.playerName;
        $ctrl.player = Player.get({ playerName: $stateParams.playerName });
      } else {
        $ctrl.ownAccount = true;
        $ctrl.account = account;
      }
      $ctrl.showTransferInfo = function() {
        $mdDialog.show({
          templateUrl: 'app/account/transfer-info.tmpl.html',
          clickOutsideToClose: true,
          controllerAs: '$ctrl',
          controller() {
            this.closeTransferInfo = function() {
              $mdDialog.hide();
            };
          }
        });
      };
      $ctrl.openDeposit = function() {
        $mdDialog.show({
          templateUrl: 'app/account/deposit.tmpl.html',
          clickOutsideToClose: true,
          controllerAs: '$ctrl',
          controller() {
            this.close = function() {
              $mdDialog.hide();
            };
            this.deposit = function() {
              $ctrl.account.deposit($stateParams.playerName, this.form.amount, this.form.message || 'Overført via MobilePay')
                .then(() => $ctrl.account.$refresh().then(() => $mdDialog.hide()));
            };
          }
        });
      };
      $ctrl.openWithdraw = function() {
        $mdDialog.show({
          templateUrl: 'app/account/withdraw.tmpl.html',
          clickOutsideToClose: true,
          controllerAs: '$ctrl',
          controller() {
            this.close = function() {
              $mdDialog.hide();
            };
            this.withdraw = function() {
              $ctrl.account.withdraw($stateParams.playerName, this.form.amount, this.form.message || 'Udbetalt')
                .then(() => $ctrl.account.$refresh().then(() => $mdDialog.hide()));
            };
          }
        });
      };
      $ctrl.openTransfer = function() {
        $mdDialog.show({
          templateUrl: 'app/account/transfer.tmpl.html',
          clickOutsideToClose: true,
          controllerAs: '$ctrl',
          controller: ['Player', function(Player) {
            this.players = Player.query();
            this.close = function() {
              $mdDialog.hide();
            };
            this.transfer = function() {
              $ctrl.account.transfer($stateParams.playerName, this.form.amount, this.form.message, this.form.receiver)
                .then(() => $ctrl.account.$refresh().then(() => $mdDialog.hide()));
            };
          }]
        });
      };
    }]
  })
  .component('accounts', {
    templateUrl: 'app/account/accounts.tmpl.html',
    controller: ['Player', '$state', function(Player, $state) {
      const $ctrl = this;
      $ctrl.players = Player.query();
      $ctrl.account = (player) => {
        $state.go('f2015.account', {
          playerName: player.playername
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
