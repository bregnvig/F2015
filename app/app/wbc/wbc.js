'use strict';

angular.module('f2015.wbc', ['f2015.model.wbc'])
  .controller('WbcCtrl', ['wbcModel', function(wbcModel) {
    var wbc = this;
    wbc.standing = wbcModel.standing;
  }])
  .controller('WbcPlayerCtrl', ['$stateParams', 'wbcModel', function($stateParams, wbcModel) {
    var wbcPlayer = this;
    wbcPlayer.entries = wbcModel.get($stateParams.player);
  }]);
