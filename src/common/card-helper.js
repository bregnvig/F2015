'use strict';

angular
  .module('f2015.common.cardHelper', [])
  .factory('cardShowHide', function() {
    return (scope, element, attrs, $ctrl) => {
      if (!$ctrl.isVisible) {
        throw new Error('Controller must imlement isVisible function');
      }
      scope.$watch($ctrl.isVisible, (newValue) => {
        if (newValue) {
          element.removeClass('ng-hide');
        } else {
          element.addClass('ng-hide');
        }
      });
    };
  });
