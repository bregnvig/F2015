'use strict';

angular.module('f2015.driver', ['f2015.model.driver', 'f2015.model.ergast'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('f2015.drivers', {
        url: '/drivers',
        views: {
          '@': {
            template: '<drivers></drivers>'
          }
        }
      })
      .state('f2015.drivers.show', {
        url: '/{id}',
        views: {
          '@': {
            template: '<driver></driver>'
          }
        }
      });
  }])
  .component('drivers', {
    templateUrl: 'app/driver/drivers.tmpl.html',
    controller: ['$state', 'driverModel', 'ergastModel', function($state, driverModel, ergastModel) {
      const $ctrl = this;
      driverModel.all.$promise.then((all) => {
        $ctrl.all = all;
        ergastModel.getStandings((standings) => {
          standings.forEach((standing) => {
            $ctrl.all.forEach((driver) => {
              if (driver.code === standing.Driver.driverId) {
                driver.points = standing.points;
              }
            });
          });
          $ctrl.all.sort((a, b) => b.points - a.points);
        });
      });
      $ctrl.navigateTo = (state, params) => $state.go(state, params);
    }]
  })
  .component('driver', {
    templateUrl: 'app/driver/driver.tmpl.html',
    controller: ['$scope', '$stateParams', 'ergastModel', 'driverModel', 'credentials', function($scope, $stateParams, ergastModel, driverModel, credentailsProvider) {
      const $ctrl = this;
      $ctrl.previousYear = ergastModel.previousSeason;
      $ctrl.currentYear = ergastModel.currentSeason;

      credentailsProvider().then((credentials) => $ctrl.credentials = credentials);
      driverModel.all.$promise.then((all) => {
        $ctrl.driver = all.find((temp) => temp.id === parseInt($stateParams.id));
        if ($ctrl.driver) {
          $ctrl.qualifyResult = ergastModel.getLastYearDriverQualify($ctrl.driver.code);
          $ctrl.raceResult = ergastModel.getLastYearDriverResults($ctrl.driver.code);
          ergastModel.getCurrentYearDriverStatus($ctrl.driver.code, (result) => {
            $ctrl.retired = result.reduce((previousValue, status) => previousValue + (status.status === 'Finished' ? 0 : parseInt(status.count)), 0).toFixed(1);
          });
          ergastModel.getCurrentYearDriverQualify($ctrl.driver.code, (result) => {
            $ctrl.currentQualifyResult = result;
            var grid = result.reduce((previousValue, race) => previousValue + parseInt(race.QualifyingResults[0].position), 0);
            $ctrl.avgGrid = result.length !== 0 ? (grid / result.length).toFixed(1) : '-';
          });
          ergastModel.getCurrentYearDriverResults($ctrl.driver.code, (result) => {
            $ctrl.currentRaceResult = result;
            var position = result.reduce((previousValue, race) => previousValue + parseInt(race.Results[0].position), 0);
            $ctrl.avgPosition = result.length !== 0 ? (position / result.length).toFixed(1) : '-';
          });
        }
      });
      $scope.$watch(() => $ctrl.driver ? $ctrl.driver.active : undefined, (newValue) => {
        if (newValue !== undefined) {
          $ctrl.driver.partOfSeason = true;
          $ctrl.driver.$save();
        }
      });
    }]
  });

