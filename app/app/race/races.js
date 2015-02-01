'use strict';

angular.module('f2015.race', ['f2015.model.race'])
  .controller('RacesCtrl', ['raceModel', function(raceModel) {
    var races = this;
    races.races = raceModel;
  }])
  .controller('RaceCtrl', ['$stateParams', 'raceModel', function($stateParams, raceModel) {
    var race = this;
    race.get = raceModel.get($stateParams.id);
  }])
  .controller('BidCtrl', ['$stateParams', 'raceModel', function($stateParams, raceModel) {
    var bid = this;
    bid.get = raceModel.bid($stateParams.id, $stateParams.player);
  }])
  .controller('ResultCtrl', ['$stateParams', 'raceModel', function($stateParams, raceModel) {
    var bid = this;
    bid.get = raceModel.result($stateParams.id);
  }]);

