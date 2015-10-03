'use strict';

angular.module('f2015.resource', ['ngResource', 'f2015.authentication'])
  .factory('secureResource', ['$window', '$q', '$rootScope', '$resource', 'authenticationService', function($window, $q, $rootScope, $resource, authenticationService) {

    var defaultActions = {
      'get': {
        method: 'GET'
      },
      'save': {
        method: 'POST'
      },
      'query': {
        method: 'GET',
        isArray: true
      },
      'remove': {
        method: 'DELETE'
      },
      'delete': {
        method: 'DELETE'
      }
    };
    var resources = {};

    function addCredentials(actions) {
      if (authenticationService.loggedIn === false) {
        throw 'Must be logged in, before trying to add credentials';
      }
      Object.getOwnPropertyNames(actions).forEach(function(property) {
        var action = actions[property];
        if (!action.headers) {
          action.headers = {};
        }
        action.headers.Authorization = 'Basic ' + $window.btoa(authenticationService.credentials.playername + ':' + authenticationService.credentials.token);
      });
      return actions;
    }

    function getResourceProxy(actions) {
      if (authenticationService.loggedIn === true) {
        throw 'Already logged in. Proxy methods should not be used when logged in';
      }

      var proxy = {};

      Object.getOwnPropertyNames(actions).forEach(function(actionName) {
        var action = actions[actionName];
        proxy[actionName + '-metadata'] = addProxyAction(action.isArray);
        proxy[actionName] = proxy[actionName + '-metadata'].action;
      });
      return proxy;
    }

    function addProxyAction(isArray) {
      var invocations = [];
      var action;
      return {
        get invocations() {
          return invocations;
        },
        set real(value) {
          action = value;
        },
        get real() {
          return action;
        },
        action: function() {
          if (!action) {
            var invocation = {
              deferred: $q.defer(),
              arguments: arguments,
              result: isArray ? [] : {}
            };
            invocations.push(invocation);
            invocation.result.$promise = invocation.deferred.promise;
            return invocation.result;
          } else {
            return action.apply(undefined, arguments);
          }
        }
      };
    }

    function getResourceReal(url, paramDefaults, actions, options) {
      actions = actions || defaultActions;
      return $resource(url, paramDefaults, addCredentials(actions), options);
    }

    function lazyExecutedAction(metadata, invocation) {
      metadata.real.apply(undefined, invocation.arguments).$promise.then(function(result) {
        angular.copy(result, invocation.result);
        invocation.deferred.resolve(invocation.result);
        console.log('Invocation result', invocation.result);
      }, function() {
        invocation.deferred.reject();
      });
    }

    $rootScope.$on('login-successful', function(event, credentials) {
      console.log('Credentials', credentials);
      Object.getOwnPropertyNames(resources).forEach(function(resourceName) {
        var resource = resources[resourceName];
        var real = getResourceReal.apply(undefined, resource.arguments);
        Object.getOwnPropertyNames(resource.proxy).forEach(function(actionName) {
          if (!actionName.match(/-metadata$/)) {
            var metadata = resource.proxy[actionName + '-metadata'];
            metadata.real = real[actionName];
            while (metadata.invocations.length) {
              lazyExecutedAction(metadata, metadata.invocations.shift());
            }
          }
        });
      });
    });

    function resourceFactory(url, paramDefaults, actions, options) {

      if (authenticationService.loggedIn) {
        console.log('Getting the real resource since we are logged in');
        return getResourceReal(url, paramDefaults, angular.extend({}, defaultActions, actions), options);
      } else {
        console.log('Getting the proxy resource since we are not logged in');
        resources[url] = {
          arguments: arguments,
          proxy: getResourceProxy(angular.extend({}, defaultActions, actions))
        };
        return resources[url].proxy;
      }
    }

    return resourceFactory;
  }]);
