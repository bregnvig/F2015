'use strict';

angular
  .module('f2015.model.account', ['ngResource', 'config'])
  .factory('Account', ['$resource', '$http', 'ENV', function($resource, $http, ENV) {

    const operation = (operation, amount, message, owner, receiver) => {
      return $http.post(ENV.apiEndpoint + `/ws/v2/player/${owner}/account`, {
        operation,
        amount,
        message,
        receiver
      });
    };

    const Account = $resource(ENV.apiEndpoint + '/ws/v2/player/:playerName/account', {
        'playerName': '@playername'
      },
      {
        'refresh': {
          params: {
            'playerName': '@playerName'
          },
          method: 'GET'
        }
      });

    Account.prototype.deposit = (owner, amount, message) => operation('DEPOSIT', amount, message, owner);
    Account.prototype.withdraw = (owner, amount, message) => operation('WITHDRAW', amount, message, owner);
    Account.prototype.transfer = (owner, amount, message, receiver) => operation('TRANSFER', amount, message, owner, receiver);

    return Account;
  }]);
