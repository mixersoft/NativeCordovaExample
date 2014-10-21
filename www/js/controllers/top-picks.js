'use strict';

/**
  * @ngdoc function
  * @name ionBlankApp.controller:GalleryCtrl
  * @description
  * # GalleryCtrl
  * Controller of the ionBlankApp
 */
angular.module('ionBlankApp').factory('otgData', [
  function() {
    var DAY_MS, defaults_photo, self;
    DAY_MS = 24 * 60 * 60 * 1000;
    defaults_photo = {
      id: null,
      date: null,
      rating: null,
      favorite: false
    };
    self = {
      parsePhotosFromMoments: function(moments) {
        var photos;
        photos = [];
        _.each(moments, function(v, k, l) {
          if (v['type'] === 'moment') {
            return _.each(v['value'], function(v2, k2, l2) {
              if (v2['type'] === 'date') {
                return _.each(v2['value'], function(pid) {
                  return photos.push(_.defaults({
                    id: pid,
                    date: v2['key']
                  }, defaults_photo));
                });
              }
            });
          }
        });
        return photos;
      },
      parseMomentsFromCameraRollByDate: function(cameraRollDates) {
        var dates, moments, _current, _last;
        dates = _.keys(cameraRollDates);
        dates.sort();
        _current = _last = null;
        moments = _.reduce(dates, function(result, k) {
          var date, o;
          date = _.isDate(k) ? k : new Date(k);
          if (_current != null) {
            if (date.setHours(0, 0, 0, 0) === _last + DAY_MS) {
              _last = date.setHours(0, 0, 0, 0);
              _current.days[k] = cameraRollDates[k];
            } else {
              _current = _last = null;
            }
          }
          if (_current == null) {
            _last = date.setHours(0, 0, 0, 0);
            o = {};
            o[k] = cameraRollDates[k];
            _current = {
              label: k,
              days: o
            };
            result[_current.label] = _current.days;
          }
          return result;
        }, {});
        return moments;
      },
      orderMomentsByDescendingKey: function(o, levels) {
        var keys, recurse, reversed;
        if (levels == null) {
          levels = 1;
        }
        keys = _.keys(o).sort().reverse();
        recurse = levels - 1;
        reversed = _.map(keys, function(k) {
          var item;
          item = {
            key: k
          };
          item.type = recurse ? 'moment' : 'date';
          item.value = recurse > 0 ? self.orderMomentsByDescendingKey(o[k], recurse) : o[k];
          return item;
        });
        return reversed;
      }
    };
    return self;
  }
]).directive('otgPreview', [
  '$window', function($window) {
    var default_options;
    default_options = {
      width: 320,
      height: 240
    };
    return {
      template: '<img ng-src="{{photo.src}}" height="{{photo.height}}">',
      restrict: 'EA',
      scope: false,
      link: function(scope, element, attrs) {
        var options, src, _ref, _ref1;
        if (!((_ref = scope.$parent.options) != null ? _ref.width : void 0)) {
          scope.$parent.options = _.defaults(scope.$parent.options || {}, default_options);
        }
        options = _.clone(scope.$parent.options);
        if (!((_ref1 = scope.photo) != null ? _ref1.height : void 0) && (scope.photo.id.slice(-5, -4) < '4')) {
          options.height = 400;
        }
        src = "http://lorempixel.com/" + options.width + "/" + options.height + "?" + scope.photo.id;
        scope.photo.src = src;
        scope.photo.height = options.height;
      }
    };
  }
]).directive('anim-slide-out-left-then-hide', [
  '$ionicAnimation', function($ionicAnimation) {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, element, attrs) {
        var animation;
        return animation = $ionicAnimation({
          name: 'animSlideOutLeftThenHide',
          duration: 0.5,
          delay: 0,
          autoReverse: false,
          repeat: 0,
          curve: 'linear',
          onStart: function() {
            return element.addClass('slide-out-left');
          },
          onEnd: function() {
            return element.removeClass('slide-out-left');
          }
        });
      }
    };
  }
]).filter('fake', function() {
  return function(input, type) {
    var match;
    if (type == null) {
      type = 'none';
    }
    switch (type) {
      case 'none':
        return input;
      case 'favorites':
        match = '2468ACE';
        break;
      case 'shared':
        match = '2ACE';
    }
    return _.reduce(input, function(result, e, i) {
      if (match.indexOf(e.id.slice(-5, -4)) > 0) {
        result.push(e);
      }
      return result;
    }, []);
  };
}).controller('TopPicksCtrl', [
  '$scope', '$rootScope', '$state', 'otgData', '$timeout', 'TEST_DATA', 'fakeFilter', function($scope, $rootScope, $state, otgData, $timeout, TEST_DATA, fakeFilter) {
    var init, setFilter;
    $scope.label = {
      title: "Top Picks",
      header_card: {
        'app.top-picks': {
          header: "Top Picks",
          body: "A selection of Top Picks from our Curators to help you re-live your favorite Moments",
          footer: ""
        },
        'app.top-picks.favorites': {
          header: "Favorites",
          body: "A selection of your Favorite Shots to help you re-live your favorite Moments",
          footer: ""
        },
        'app.top-picks.shared': {
          header: "Shared",
          body: "A selection of Top Picks and Favorite Shots you have Shared from this App",
          footer: ""
        }
      }
    };
    window.$state = $scope.$state = $state;
    $scope.state = {
      showDelete: false,
      showReorder: false,
      canSwipe: true
    };
    $scope.getItemHeight = function(item, index) {
      return $scope.filteredPhotos[index].height;
    };
    $scope.edit = function(item) {
      return alert('Edit Item: ' + item.id);
    };
    $scope.share = function(item) {
      return alert('Share Item: ' + item.id);
    };
    $scope.dontShowHint = function(hide) {
      var current, property, target, _ref;
      current = $scope.$state.current.name.split('.').pop();
      if (hide) {
        target = ionic.DomUtil.getParentOrSelfWithClass(hide.currentTarget, 'card');
        target = angular.element(target).addClass('card-animate').addClass('slide-out-left-hide');
        property = $scope.config['dont-show-again']['top-picks'];
        $timeout(function() {
          property[current] = true;
          return target.removeClass('card-animate').removeClass('slide-out-left-hide');
        }, 500);
      }
      return (_ref = $scope.config['dont-show-again']['top-picks']) != null ? _ref[current] : void 0;
    };
    $scope.reorderItem = function(items, item, fromIndex, toIndex) {
      items.splice(fromIndex, 1);
      return items.splice(toIndex, 0, item);
    };
    setFilter = function(toState) {
      switch (toState.name) {
        case 'app.top-picks':
          $scope.filteredPhotos = fakeFilter($scope.photos, 'none');
          break;
        case 'app.top-picks.favorites':
          $scope.filteredPhotos = fakeFilter($scope.photos, 'favorites');
          break;
        case 'app.top-picks.shared':
          $scope.filteredPhotos = fakeFilter($scope.photos, 'shared');
      }
    };
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {
      return setFilter(toState);
    });
    init = function() {
      $scope.photos_ByDate = TEST_DATA.cameraRoll_byDate;
      $scope.moments = otgData.orderMomentsByDescendingKey(otgData.parseMomentsFromCameraRollByDate($scope.photos_ByDate), 2);
      $scope.photos = otgData.parsePhotosFromMoments($scope.moments);
      setFilter($state.current);
      $scope.menu.top_picks.count = $scope.photos.length;
      _.each($scope.photos, function(e, i, l) {
        e.height = e.id.slice(-5, -4) < '4' ? 400 : 240;
        e.src = "http://lorempixel.com/" + 320. + "/" + e.height + "?" + e.id;
      });
    };
    return init();
  }
]);
