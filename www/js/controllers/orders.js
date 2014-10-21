'use strict';

/**
  * @ngdoc function
  * @name ionBlankApp.controller:OrdersCtrl
  * @description
  * # OrdersCtrl
  * Controller of the ionBlankApp
 */
angular.module('ionBlankApp').directive('otgOrderMoment', [
  'otgData', function(otgData) {
    var defaults, options, self, summarize;
    options = defaults = {
      thumbnailLimit: 3,
      thumbnailSize: 58 - 2
    };
    summarize = function(selectedMoments, options) {
      var end, first, i, incr, last, length, photos, sampled, start, summary, _fn, _i, _ref;
      first = selectedMoments[selectedMoments.length - 1];
      last = selectedMoments[0];
      summary = {
        key: last.key,
        type: 'summaryMoment',
        value: []
      };
      start = first.value[0];
      end = last.value[0];
      length = 2 * options.thumbnailLimit;
      photos = otgData.parsePhotosFromMoments(selectedMoments);
      if (photos.length <= options.thumbnailLimit) {
        start.value = photos;
      } else if (photos.length <= length) {
        start.value = photos.slice(0, options.thumbnailLimit);
        end.value = photos.slice(options.thumbnailLimit, length - 1);
      } else {
        incr = Math.floor(photos.length / (length - 1));
        sampled = [];
        _fn = function(i) {
          return sampled.push(photos[i]);
        };
        for (i = _i = 0, _ref = photos.length; incr > 0 ? _i <= _ref : _i >= _ref; i = _i += incr) {
          _fn(i);
        }
        sampled[sampled.length - 1] = photos[photos.length - 1];
        sampled.reverse();
        start.value = sampled.slice(0, 3);
        end.value = sampled.slice(3, 6);
      }
      summary.value.push(start);
      summary.value.push(end);
      return summary;
    };
    self = {
      templateUrl: 'partials/otg-summary-moment',
      restrict: 'EA',
      scope: {
        moments: '=otgModel'
      },
      link: function(scope, element, attrs) {
        scope.options = _.clone(defaults);
        if (scope.moments.length) {
          scope.summaryMoment = summarize(scope.moments, scope.options);
          scope.from = scope.summaryMoment.value[0];
          scope.to = scope.summaryMoment.value[1];
        }
      }
    };
    return self;
  }
]).controller('OrdersCtrl', [
  '$scope', '$ionicTabsDelegate', 'otgData', 'otgWorkOrder', 'TEST_DATA', function($scope, $ionicTabsDelegate, otgData, otgWorkOrder, TEST_DATA) {
    var init;
    $scope.label = {
      title: "Order History",
      subtitle: "Share something great today!"
    };
    $scope.gotoTab = function(name) {
      var index;
      switch (name) {
        case 'complete':
          index = 1;
          break;
        default:
          index = 0;
      }
      return $ionicTabsDelegate.select(index);
    };
    $scope.filterStatusNotComplete = function(o) {
      if (o.status !== 'complete') {
        return o;
      }
    };
    init = function() {
      $scope.orders = TEST_DATA.orders;
    };
    return init();
  }
]);
