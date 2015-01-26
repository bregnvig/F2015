'use strict';

angular.module('f2015.resource', ['ngResource', 'f2105.authentication'])
  .factory('secureResource', ['$window', '$rootScope', '$resource', 'authenticationService', function($window, $rootScope, $resource, authenticationService) {

    var defaultActions = {
      'get': {method: 'GET'},
      'save': {method: 'POST'},
      'query': {method: 'GET', isArray: true},
      'remove': {method: 'DELETE'},
      'delete': {method: 'DELETE'}
    };
    //$http.defaults.headers.common.Authorization =
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
        action.headers.Authorization = 'Basic ' + $window.btoa(authenticationService.credentials.playername+':'+authenticationService.credentials.token);
      });
      return actions;
    }

    function getResourceProxy(actions) {
      if (authenticationService.loggedIn === true) {
        throw 'Already logged in. Proxy methods should not be used when logged in';
      }

      var proxy = {};

      Object.getOwnPropertyNames(actions).forEach(function(property) {
        var action = actions[property];
        proxy[property] = addProxyAction(action.isArray);
      });
      return proxy;
    }

    function addProxyAction(isArray) {
      var invocations = [];
      var action;
      return function() {
        function getInvocations() {
          return invocations;
        }
        function setAction(value) {
          action = value;
        }
        if (!action) {
          var invocation = {
            arguments: arguments,
            result: isArray ? [] : {}
          };
          invocations.push(invocation);
          return invocation.result;
        } else {
          return action.apply(undefined, arguments);
        }
      };
    }

    function getResourceReal(url, paramDefaults, actions, options) {
      actions = angular.extend({}, defaultActions, actions);
      return $resource(url, paramDefaults, addCredentials(actions), options);
    }

    $rootScope.$watch('login-successful', function (credentials) {
      Object.getOwnPropertyNames(resources).forEach(function(resource) {
        var real = getResourceReal.apply(undefined, resource.arguments);
        Object.getOwnPropertyNames(resource.proxy).forEach(function(actionName) {
          resource.proxy.setAction(real[actionName]);
          resource.proxy.getInvocations().forEach(function(invocation) {
            real[actionName](invocation.arguments).then(function(result) {
              angular.copy(invocation.result, result);
            });
          });
        });
      });
    });

    function resourceFactory(url, paramDefaults, actions, options) {

      if (authenticationService.loggedIn) {
        return getResourceReal(url, paramDefaults, actions, options);
      } else {
        actions = angular.extend({}, defaultActions, actions);
        resources[url] = {
          arguments: arguments,
          proxy: getResourceProxy(actions)
        };
        return resources[url].proxy;
      }
    }
    return resourceFactory;
  }]);
