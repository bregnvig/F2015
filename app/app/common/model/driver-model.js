'use strict';

angular.module('f2015.model.driver', ['f2015.resource', 'config'])
  .factory('driverModel', ['secureResource', 'ENV', function(secureResource, ENV) {

    var driversResource = secureResource(ENV.apiEndpoint+'/ws/race/drivers');
    var drivers = {};

    driversResource.query(function(fetchedDrivers) {
      fetchedDrivers.forEach(function(driver) {
        if (!drivers[driver.code]) {
          drivers[driver.code] = driver;
        } else {
          angular.copy(driver, drivers[driver.code]);
        }
      });
    });

    return {
      getDriver: function(code) {
        if(!drivers[code]) {
          drivers[code] = {};
        }
        return drivers[code];
      }
    };
  }]);
