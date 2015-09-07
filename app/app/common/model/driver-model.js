'use strict';

angular.module('f2015.model.driver', ['f2015.resource', 'config'])
  .factory('driverModel', ['secureResource', 'ENV', function(secureResource, ENV) {

    var driversResource = secureResource(ENV.apiEndpoint+'/ws/drivers');
    var resources;
    var drivers = {};

    resources = driversResource.query({all: true}, function(fetchedDrivers) {
      fetchedDrivers.forEach(function(driver) {
        if (!drivers[driver.code]) {
          drivers[driver.code] = driver;
        } else {
          angular.copy(driver, drivers[driver.code]);
        }
      });
    });

    return {
      getDriver: function(driverId) {
        if(!drivers[driverId]) {
          drivers[driverId] = {};
        }
        return drivers[driverId];
      },
      convert: function(driverIds) {
        if (!driverIds) {
          return null;
        } else if (Array.isArray(driverIds)) {
          return driverIds.map(function(driverId) {
            return this.getDriver(driverId);
          }, this);
        } else {
          return this.getDriver(driverIds);
        }
      },
      get activeDrivers() {
        return driversResource.query();
      },
      get all() {
        return resources;
      }
    };
  }]);
