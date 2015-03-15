'use strict';

angular.module('f2015.wbc', ['f2015.model.wbc'])
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('f2015.wbc', {
        url: '/wbc',
        views: {
          '@': {
            templateUrl: 'app/wbc/wbc.tmpl.html',
            controller: 'WbcCtrl as wbc'
          }
        }
      })
      .state('f2015.wbc.player', {
        url: '/player/:player',
        views: {
          '@': {
            templateUrl: 'app/wbc/player.tmpl.html',
            controller: 'WbcPlayerCtrl as wbcPlayer'
          }
        }
      })
      .state('f2015.wbc.graph', {
        url: '/graph',
        views: {
          '@': {
            templateUrl: 'app/wbc/wbc-graph.tmpl.html',
            controller: 'WbcGraphCtrl as wbcGraph'
          }
        }
      });
  }])
  .controller('WbcCtrl', ['wbcModel', function(wbcModel) {
    var wbc = this;
    wbc.standing = wbcModel.standing;
  }])
  .controller('WbcPlayerCtrl', ['$stateParams', 'wbcModel', function($stateParams, wbcModel) {
    var wbcPlayer = this;
    wbcPlayer.entries = wbcModel.get($stateParams.player);
  }])
  .controller('GraphPeopleCtrl', ['$rootScope', '$scope', '$mdBottomSheet', 'wbcModel', 'colors', function($rootScope, $scope, $mdBottomSheet, wbcModel, colors) {
    $scope.colors = colors;
    var partOfGraph = localStorage.partOfGraph !== undefined ? JSON.parse(localStorage.partOfGraph) : undefined;

    wbcModel.graph.$promise.then(function(history) {
      if (!partOfGraph) {
        partOfGraph = {};
        history.forEach(function(element) {
          element.positions.forEach(function(position) {
            partOfGraph[position.player.playername] = true;
          });
        });
        localStorage.partOfGraph = JSON.stringify(partOfGraph);
      }
      var people = [];
      var playerNames = [];
      history.forEach(function(element) {
        element.positions.forEach(function(position) {
          if (playerNames.indexOf(position.player.playername) === -1) {
            people.push(position.player);
            playerNames.push(position.player.playername);
          }
        });
      });
      $scope.players = people;
    });
    $scope.partOfGraph = partOfGraph;
    $scope.$watch('partOfGraph', function () {
      console.log('Changed');
      localStorage.partOfGraph = JSON.stringify(partOfGraph);
      $rootScope.$broadcast('wbc-players-updated');
    }, true);
  }])
  .directive('wbcGraph', ['$timeout', 'wbcModel', 'colors', function($timeout, wbcModel, colors) {

    function createGraph(history, element) {
      var partOfGraph = localStorage.partOfGraph !== undefined ? JSON.parse(localStorage.partOfGraph) : {};
      var playerColorIndex = 0;
      var numberOfPlayers = 0;
      var dataSets = {};
      var lineChartData = {labels: [], datasets : []};
      history.forEach(function(element, index) {
        lineChartData.labels.push(element.race.name);
        element.positions.forEach(function(position) {
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
              for(var j = 0; j < index; j++) {
                dataSets[position.player.playername].data[j] = numberOfPlayers;
              }
            }
          }
          dataSets[position.player.playername].data[index] = position.position;
        });
      });

      lineChartData.datasets = [];
      Object.getOwnPropertyNames(dataSets).forEach(function(playerName) {
        if (partOfGraph[playerName] === true) {
          dataSets[playerName].data.unshift(numberOfPlayers);
          lineChartData.datasets.push(dataSets[playerName]);
        }
      });
      lineChartData.labels.unshift('');
      var canvas = element.find('canvas')[0];
      canvas.width= element.find('div')[0].clientWidth;
      canvas.height = element.find('div')[0].clientHeight-64;
      var lineChart = lineChart || new Chart(canvas.getContext('2d'));
      lineChart.Line(lineChartData, {
        scaleOverride : true,
        scaleSteps : numberOfPlayers,
        scaleStepWidth : -1,
        scaleShowLabels : false,
        scaleStartValue: numberOfPlayers+1,
        animation : false,
        datasetFill : false,
        datasetStrokeWidth : 4,
        pointDot : false,
        bezierCurve : false,
        showTooltips: false,
        maintainAspectRatio:false,
        responsive: true});
    }

    function link($scope, element) {
      $timeout(function() {
        wbcModel.graph.$promise.then(function(history) {
          $scope.$on('wbc-players-updated', function () {
            createGraph(history, element);
          });
          createGraph(history, element);
        });
      }, 300);
    }

    return {
      restrict: 'E',
      templateUrl: 'app/wbc/graph.tmpl.html',
      link: link
    };
  }])
  .controller('WbcGraphCtrl', ['$scope', '$mdBottomSheet', function($scope, $mdBottomSheet) {
    var wbcGraph = this;
    wbcGraph.showPlayers = function($event) {
      $mdBottomSheet.show({
        templateUrl: 'app/wbc/graph-people.tmpl.html',
        controller: 'GraphPeopleCtrl',
        targetEvent: $event
      });
    };
  }])
  .directive('joinWbcCard',['$mdDialog', '$mdToast', 'wbcModel', 'authenticationService', function($mdDialog, $mdToast, wbcModel, authenticationService) {
    return {
      restrict: 'E',
      templateUrl: 'app/wbc/join-wbc-card.tmpl.html',
      link: function($scope, element) {
        $scope.wbc = wbcModel.wbc;

        $scope.$watch('wbc.latestJoinDate', function (newValue) {
          if (newValue && newValue > new Date() && authenticationService.credentials.wbcParticipant === false) {
            element.removeClass('ng-hide');
          }
        });

        $scope.joinWBC = function() {
          var confirm = $mdDialog.confirm()
            .title('Deltag i WBC?')
            .content('Tilmeldingen koster 100 og tilmeldingen er bindende. Ønsker du at deltage?')
            .ariaLabel('Bekræft deltagelse')
            .ok('Ja tak!')
            .cancel('Så alligevel ikke');
          $mdDialog.show(confirm).then(function() {
            wbcModel.join(authenticationService.credentials).$promise.then(function() {
              authenticationService.credentials.wbcParticipant = true;
              authenticationService.save();
              $mdToast.show($mdToast.simple().content('Du er nu tilmeldt WBC!'));
              element.addClass('ng-hide');
            });
          });
        };
      }
    };
  }]);
