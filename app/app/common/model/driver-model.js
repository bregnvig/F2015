'use strict';

angular.module('f2015.model.driver', ['ngResource', 'config'])
  .factory('driverModel', ['$resource', 'ENV', function($resource, ENV) {

    const driversResource = $resource(ENV.apiEndpoint+'/ws/drivers');
    const drivers = {};
    const resources = driversResource.query({all: true}, (fetchedDrivers) => {
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
          return driverIds.map((driverId) => this.getDriver(driverId));
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
