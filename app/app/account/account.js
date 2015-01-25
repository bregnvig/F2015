'use strict';

angular.module('f2015.account')
  .controller('AccountCtrl', ['accountService', function(accountService) {
    var account = this;
    account.account = accountService;
  }]);
