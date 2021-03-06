'use strict';

/* Controllers */

angular.module('map.controllers', [])
  
  .controller('landlords', ['$scope', '$http', '$state', '$rootScope', function($scope, $http, $state, $rootScope) {
    $http.get('json/landlords.json').success(function(data) {
      $scope.landlords = data;
      $scope.$broadcast("landlordsLoaded", {});
    });

    //$scope.goLandlord = function(landlordId) {
    //  $state.go('landlords.landlord', {landlordId: landlordId});
    //}

    $scope.search = function() {
      $('.leaflet-control-geosearch form').removeClass('displayNone');
      $('.leaflet-control-geosearch form input').focus();
    }

    $scope.locate = function() {
      window.locate.locate();
      //document.location.hash = '/buildings';
    }

    $scope.units = function(a, b) {
      return parseInt(a) + parseInt(b);
    }

    //$rootScope.class = 'page-landlords';
  }])



  .controller('landlord', ['$scope', '$http', '$stateParams', '$rootScope', 'filterFilter', '$timeout', function($scope, $http, $stateParams, $rootScope, filterFilter, $timeout) {
    $http.get('json/landlords/landlord-'+ $stateParams.landlordId +'.json').success(function(data) {
      if (window.markerGroup != undefined) {
        window.markerGroup.clearLayers();
      }
      $scope.buildings = data;
      $scope.landlord = filterFilter($scope.landlords, {LandlordId: $stateParams.landlordId})[0];
      $scope.landlord.change = 0;
      $scope.building = undefined;

      for (var i=0; i<$scope.buildings.length; i++){
        var building = $scope.buildings[i];
        $scope.landlord.change += building.change;

        L.mapbox.featureLayer({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              building.lng,
              building.lat
            ]
          },
          properties: {
              'marker-size': 'large',
              'marker-color': '#2D3645', // $blue-topnav1
          }
        }).addTo(window.markerGroup);
      }


      $scope.units = function(a, b) {
        return parseInt(a) + parseInt(b);
      }


      $scope.mouseoverBuilding = function(id) {
        $scope.hoverBuilding = $scope.getBuilding(id);
        $timeout(function (){
          if ($scope.hoverBuilding!= undefined && $scope.building == undefined) {
            var template = angular.element('#popup-building-teaser').html();
            var popup = L.popup({autoPanPadding: [200, 200], autoPan: true})
              .setLatLng(new L.LatLng($scope.hoverBuilding.lat, $scope.hoverBuilding.lng))
              .setContent(template)
              .openOn(window.map);
          }
          
        });
      }

      $scope.mouseoutBuilding = function(id) {
        if ($scope.hoverBuilding!= undefined) {
          if ($scope.building == undefined) {
            window.map.closePopup();
          }
          $scope.hoverBuilding = undefined;
        }
      }

      $scope.clickBuilding = function(id) {
        $scope.building = $scope.getBuilding(id);
        $timeout(function (){
          console.log($scope);
          var template = angular.element('#popup-building-full').html();
          var popup = L.popup()
            .setLatLng(new L.LatLng($scope.building.lat, $scope.building.lng))
            .setContent(template)
            .openOn(window.map);
        });
      }
      
      $scope.getBuilding = function(id) {
        return filterFilter($scope.buildings, {id: id})[0];
      }

      // @todo: fitbounds snt working?
      // window.map.fitBounds(window.markerGroup.getBounds());
      window.map.setView([$scope.buildings[0].lat, $scope.buildings[0].lng], 14, {animate: true});
      

    });

    //$rootScope.class = 'page-landlord';
  }])
  


  .controller('buildings', ['$scope', '$http', '$stateParams', '$rootScope', '$compile', '$timeout', 'filterFilter', function($scope, $http, $stateParams, $rootScope, $compile, $timeout, filterFilter) {
    $scope.borough = config.boroughs[$stateParams.boroughId];
    $scope.borough.id = $stateParams.boroughId;
    window.map.setView([$scope.borough.lat, $scope.borough.lng], $scope.borough.zoom, {animate: true});


    $http.get('json/buildings-'+ $stateParams.boroughId +'.json').success(function(data) {
      $scope.buildings = data;
      //console.log(data);
    }); 

    // ng-click callbacks
    $scope.selectTab = function(tab) {
      $scope.activeTab = tab;
    }

     $scope.mouseoverBuilding = function(id) {
      $scope.hoverBuilding = $scope.getBuilding(id);
      $timeout(function (){
        if ($scope.hoverBuilding!= undefined && $scope.building == undefined) {
          var template = angular.element('#popup-building-teaser').html();
          var popup = L.popup({autoPanPadding: [200, 200], autoPan: true})
            .setLatLng(new L.LatLng($scope.hoverBuilding.lat, $scope.hoverBuilding.lng))
            .setContent(template)
            .openOn(window.map);
        }
        
      });
    }

    $scope.mouseoutBuilding = function(id) {
      if ($scope.hoverBuilding!= undefined) {
        if ($scope.building == undefined) {
          window.map.closePopup();
        }
        $scope.hoverBuilding = undefined;
      }
    }

    $scope.clickBuilding = function(id) {
      $scope.building = $scope.getBuilding(id);
      $timeout(function (){
        var template = angular.element('#popup-building-full').html();
        var popup = L.popup()
          .setLatLng(new L.LatLng($scope.building.lat, $scope.building.lng))
          .setContent(template)
          .openOn(window.map);
      });
    }
    
    $scope.getBuilding = function(id) {
      return filterFilter($scope.buildings, {id: id})[0];
    }

    //$rootScope.class = 'page-buildings';
  }])



  .controller('building', ['$scope', '$http', '$stateParams', '$rootScope', 'filterFilter', function($scope, $http, $stateParams, $rootScope, filterFilter) {
    $http.get('json/buildings/building-'+ $stateParams.buildingId +'.json').success(function(data) {
      $scope.building = data;
    });

    $scope.goLandlord = function(landlordId) {
      console.log($scope);
      //$state.go('landlords.landlord', {landlordId: landlordId});
    }

    $scope.close = function() {
      $state.go('^');
    }

    //$rootScope.class = 'page-building move-left';
  }])


  .controller('buildingHistory', ['$scope', '$http', '$stateParams', '$timeout', 'filterFilter', function($scope, $http, $stateParams, $timeout, filterFilter) {
    $timeout(function (){
      var building = $scope.$parent.building;
      $scope.chartObject = {};
        $scope.chartObject.data = {"cols": [
          {id: "t", label: "Year", type: "string"},
          {id: "s", label: "Violations", type: "number"}
        ], "rows": [
          {c: [
              {v: "2012"},
              {v: building.num2012},
          ]},
          {c: [
              {v: "2013"},
              {v: building.num2013}
          ]},
          {c: [
              {v: "2014"},
              {v: building.num2014},
          ]},
          {c: [
              {v: "2015"},
              {v: building.num2015},
          ]}
      ]};
      $scope.chartObject.type = 'AreaChart';
      $scope.cssStyle = 'height: 500px;';
    }, 1000);
  }])


  .controller('buildingBreakdown', ['$scope', '$http', '$stateParams', '$timeout', 'filterFilter', function($scope, $http, $stateParams, $timeout, filterFilter) {
    $timeout(function (){
      var building = $scope.$parent.building;
      $scope.chartObject = {};
        $scope.chartObject.data = {"cols": [
          {id: "t", label: "Class", type: "string"},
          {id: "s", label: "Violationz", type: "number"}
      ], "rows": [
        {c: [
            {v: "HPD Class A Violations"},
            {v: parseInt(building.a)},
        ]},
        {c: [
            {v: "HPD Class B Violations"},
            {v: parseInt(building.b)}
        ]},
        {c: [
            {v: "HPD Class C Violations"},
            {v: parseInt(building.c)},
        ]},
        {c: [
            {v: "HPD Class I Violations"},
            {v: parseInt(building.i)}
        ]},
        {c: [
            {v: "Department of Buildings Complaints"},
            {v: parseInt(building.dob)}
        ]},
        {c: [
            {v: "Housing Court Petitions"},
            {v: parseInt(building.housingCourt)}
        ]}
      ]};
      $scope.chartObject.type = 'PieChart';
    });
  }])
