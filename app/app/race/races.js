'use strict';

angular.module('f2015.race', ['f2015.model.race'])
  .controller('RacesCtrl', ['raceModel', function(raceModel) {
    var races = this;
    races.races = raceModel;
  }]);
