'use strict';

/**
  * @ngdoc function
  * @name ionBlankApp.controller:HelpCtrl
  * @description
  * # HelpCtrl
  * Controller of the ionBlankApp
 */
angular.module('ionBlankApp').controller('HelpCtrl', function($scope) {
  $scope.label = {
    title: "Help"
  };
  return $scope.GotoLink = function(link) {};
});
