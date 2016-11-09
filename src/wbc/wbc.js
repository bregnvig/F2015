'use strict';

angular.module('f2015.wbc', ['f2015.model.wbc'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('f2015.wbc', {
        url: '/wbc',
        views: {
          '@': {
            template: '<wbc></wbc>'
          }
        }
      })
      .state('f2015.wbc.player', {
        url: '/player/:player',
        views: {
          '@': {
            template: '<wbc-player></wbc-player>'
          }
        }
      })
      .state('f2015.wbc.graph', {
        url: '/graph',
        views: {
          '@': {
            template: '<wbc-graph style="height: calc(100vh - 64px)"></wbc-graph>'
          }
        }
      });
  }])
  .component('wbc', {
    templateUrl: 'app/wbc/wbc.tmpl.html',
    controller: ['$state', 'wbcModel', function($state, wbcModel) {
      const $ctrl = this;
      $ctrl.standing = wbcModel.standing;
      $ctrl.navigateTo = (state, params) => $state.go(state, params);
    }]
  })
  .component('wbcPlayer', {
    templateUrl: 'app/wbc/player.tmpl.html',
    controller: ['$state', '$stateParams', 'wbcModel', function($state, $stateParams, wbcModel) {
      var $ctrl = this;
      $ctrl.entries = wbcModel.get($stateParams.player);
      $ctrl.navigateTo = (state, params) => $state.go(state, params);
    }]
  })
  .component('wbcGraphPeople', {
    templateUrl: 'app/wbc/graph-people.tmpl.html',
    controller: ['$rootScope', '$scope', 'wbcModel', 'colors', function($rootScope, $scope, wbcModel, colors) {
      const $ctrl = this;
      $ctrl.colors = colors;
      var partOfGraph = localStorage.partOfGraph !== undefined ? JSON.parse(localStorage.partOfGraph) : undefined;

      wbcModel.graph.$promise.then((history) => {
        if (!partOfGraph) {
          // Add all players to graph
          partOfGraph = {};
          history.forEach((element) => element.positions.forEach((position) => partOfGraph[position.player.playername] = true));
          localStorage.partOfGraph = JSON.stringify(partOfGraph);
        }
        var people = [];
        var playerNames = [];
        history.forEach((element) => {
          element.positions.forEach((position) => {
            if (playerNames.indexOf(position.player.playername) === -1) {
              people.push(position.player);
              playerNames.push(position.player.playername);
            }
          });
        });
        $ctrl.players = people;
      });
      $ctrl.partOfGraph = partOfGraph;
      $scope.$on('$destroy', () => {
        localStorage.partOfGraph = JSON.stringify(partOfGraph);
        $rootScope.$broadcast('wbc-players-updated');
      });
    }]
  })
  .directive('graph', ['$timeout', 'wbcModel', 'colors', function($timeout, wbcModel, colors) {

    function createGraph(history, element) {
      const partOfGraph = localStorage.partOfGraph !== undefined ? JSON.parse(localStorage.partOfGraph) : {};
      const dataSets = {};
      const lineChartData = {
        labels: [],
        datasets: []
      };
      let playerColorIndex = 0;
      let numberOfPlayers = 0;
      history.forEach((element, index) => {
        lineChartData.labels.push(element.race.name);
        element.positions.forEach((position) => {
          if (dataSets[position.player.playername] === undefined) {
            numberOfPlayers++;
            var color = colors[playerColorIndex++];
            dataSets[position.player.playername] = {
              strokeColor: color,
              data: []
            };
            if (partOfGraph[position.player.playername] === undefined) {
              partOfGraph[position.player.playername] = true;
            }
            if (index !== 0) {
              for (var j = 0; j < index; j++) {
                dataSets[position.player.playername].data[j] = numberOfPlayers;
              }
            }
          }
          dataSets[position.player.playername].data[index] = position.position;
        });
      });

      lineChartData.datasets = [];
      Object.keys(dataSets).forEach(function(playerName) {
        if (partOfGraph[playerName] === true) {
          dataSets[playerName].data.unshift(numberOfPlayers);
          lineChartData.datasets.push(dataSets[playerName]);
        }
      });
      lineChartData.labels.unshift('');
      const canvas = element.find('canvas')[0];
      canvas.width = element.find('div')[0].clientWidth;
      canvas.height = element.find('div')[0].clientHeight - 64;
      const lineChart = lineChart || new Chart(canvas.getContext('2d'));
      lineChart.Line(lineChartData, {
        scaleOverride: true,
        scaleSteps: numberOfPlayers,
        scaleStepWidth: -1,
        scaleShowLabels: false,
        scaleStartValue: numberOfPlayers + 1,
        animation: false,
        datasetFill: false,
        datasetStrokeWidth: 4,
        pointDot: false,
        bezierCurve: false,
        showTooltips: false,
        maintainAspectRatio: false,
        responsive: true
      });
    }

    function link($scope, element) {
      $timeout(function() {
        wbcModel.graph.$promise.then(function(history) {
          $scope.$on('wbc-players-updated', function() {
            createGraph(history, element);
          });
          createGraph(history, element);
        });
      }, 300);
    }

    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/wbc/graph.tmpl.html',
      link: link
    };
  }])
  .component('wbcGraph', {
    templateUrl: 'app/wbc/wbc-graph.tmpl.html',
    controller: ['$mdBottomSheet', function($mdBottomSheet) {
      var $ctrl = this;
      $ctrl.showPlayers = function($event) {
        $mdBottomSheet.show({
          template: '<wbc-graph-people></wbc-graph-people>',
          disableParentScroll: true,
          targetEvent: $event
        });
      };
    }]
  })
  .directive('joinWbcCard', ['cardShowHide', function(cardShowHide) {
    return {
      templateUrl: 'app/wbc/join-wbc-card.tmpl.html',
      restrict: 'E',
      scope: {},
      controllerAs: '$ctrl',
      controller: ['$mdDialog', '$mdToast', 'wbcModel', 'credentials', 'authenticationService', function($mdDialog, $mdToast, wbcModel, credentialsProvider, authenticationService) {
        const $ctrl = this;
        credentialsProvider().then((credentials) => $ctrl.credentials = credentials);

        $ctrl.wbc = wbcModel.wbc;
        $ctrl.isVisible = () => ($ctrl.wbc && $ctrl.wbc.latestJoinDate && $ctrl.wbc.latestJoinDate > Date.now()) && ($ctrl.credentials && !$ctrl.credentials.wbcParticipant);
        $ctrl.joinWBC = () => {
          console.log('HHHHH');
          var confirm = $mdDialog.confirm()
            .title('Deltag i WBC?')
            .textContent('Tilmeldingen koster 100 og tilmeldingen er bindende. Ønsker du at deltage?')
            .ariaLabel('Bekræft deltagelse')
            .ok('Ja tak!')
            .cancel('Så alligevel ikke');
          $mdDialog.show(confirm).then(function() {
            credentialsProvider().then(function(credentials) {
              wbcModel.join(credentials).$promise.then(function() {
                credentials.wbcParticipant = true;
                authenticationService.save();
                $mdToast.show($mdToast.simple().content('Du er nu tilmeldt WBC!'));
              });
            });
          });
        };
      }],
      link: cardShowHide
    };
  }]);
