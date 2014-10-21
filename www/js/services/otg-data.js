'use strict';

/**
  * @ngdoc service
  * @name ionBlankApp.OtgData
  * @description
  * # OtgData
  * Service in the ionBlankApp.
 */
angular.module('ionBlankApp').service('OtgData', function() {
  return this.user = {
    id: null,
    username: null,
    password: null,
    email: null,
    emailVerified: false,
    tos: false,
    rememberMe: false
  };
});
