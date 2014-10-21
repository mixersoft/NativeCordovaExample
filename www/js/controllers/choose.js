'use strict';

/**
  * @ngdoc function
  * @name ionBlankApp.controller:ChooseCtrl
  * @description
  * # ChooseCtrl
  * Controller of the ionBlankApp
 */
angular.module('ionBlankApp').directive('lazySrc', function() {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
      var lorempixel, options, qGetSrc, uuidExt;
      uuidExt = attrs.lazySrc;
      options = scope.options;
      qGetSrc = scope.qGetSrc;
      lorempixel = 'http://lorempixel.com/' + options.thumbnailSize + '/' + options.thumbnailSize + '?' + uuidExt;
      element.attr('src', lorempixel);
      if (qGetSrc && uuidExt.length === 40) {
        return qGetSrc(uuidExt).then(function(dataUrl) {
          console.log("return from lazy-src directive getSrc()");
          return element.attr('src', dataUrl);
        });
      }
    }
  };
}).directive('otgMoment', [
  '$window', 'otgWorkOrder', 'otgData', function($window, otgWorkOrder, otgData) {
    var defaults, options, _getAsPhotos, _lookupPhoto, _setSizes;
    options = defaults = {
      breakpoint: 480,
      'col-xs': {
        btnClass: '',
        thumbnailSize: 58 - 2,
        thumbnailLimit: null
      },
      'col-sm': {
        btnClass: 'btn-lg',
        thumbnailSize: 74 - 2,
        thumbnailLimit: null
      }
    };
    _setSizes = function(element) {
      var cfg, w, whitespace;
      w = element[0].parentNode.clientWidth;
      if (w < options.breakpoint) {
        cfg = _.clone(options['col-xs']);
        cfg.thumbnailLimit = (w - 69) / cfg.thumbnailSize;
      } else {
        cfg = _.clone(options['col-sm']);
        cfg.thumbnailLimit = (w - 88) / cfg.thumbnailSize;
      }
      whitespace = cfg.thumbnailLimit % 1;
      if (whitespace * cfg.thumbnailSize < 28) {
        cfg.thumbnailLimit -= 1;
      }
      cfg.thumbnailLimit = Math.floor(cfg.thumbnailLimit);
      return cfg;
    };
    _lookupPhoto = null;
    _getAsPhotos = function(uuids) {
      return _.map(uuids, function(uuidExt) {
        return _.findWhere(_lookupPhoto, {
          id: uuidExt
        });
      });
    };
    return {
      templateUrl: 'views/template/moment.html',
      restrict: 'EA',
      scope: {
        moments: '=otgModel'
      },
      link: function(scope, element, attrs) {
        scope.options = _setSizes(element);
        scope.getAsPhotos = _getAsPhotos;
        if (!_lookupPhoto) {
          _lookupPhoto = otgData.parsePhotosFromMoments(scope.moments);
        }
        scope.controllerScope = scope.$parent.controllerScope;
        scope.otgWorkOrder = otgWorkOrder;
        scope.ClassSelected = scope.$parent.ClassSelected;
      }
    };
  }
]).factory('otgWorkOrder', [
  function() {
    var self, _data, _moments, _reset, _selected;
    _moments = null;
    _data = [];
    _selected = _reset = {
      selectedPhotos: 0,
      contiguousPhotos: 0,
      dateRange: {
        from: null,
        to: null
      },
      days: 0,
      moments: {}
    };
    self = {
      isSelected: function() {
        return _data.length > 0;
      },
      isDaySelected: function(day) {
        var found;
        found = _.find(_data, {
          key: day.key
        });
        return found;
      },
      countSelectedPhotos: function() {
        _selected.selectedPhotos = _.reduce(_data, function(result, day) {
          result += day.value.length;
          return result;
        }, 0);
        return _selected.selectedPhotos;
      },
      setMoments: function(moments) {
        return _moments = moments || [];
      },
      getContiguousPhotos: function() {
        return otgData.parsePhotosFromMoments(_selected.moments);
      },
      countContiguousPhotos: function() {
        var contiguousPhotos, dateRange, selectedMoments;
        if (!_.isArray(_moments)) {
          return console.warn("WARNING: _moments not set, call otgWorkOrder.setMoments()");
        }
        dateRange = self.getDateRange();
        _selected.days = (new Date(dateRange.to) - new Date(dateRange.from)) / (24 * 60 * 60 * 1000) + 1;
        selectedMoments = {};
        contiguousPhotos = 0;
        _.each(_moments, function(moment) {
          var found;
          found = false;
          _.each(moment.value, function(day) {
            var _ref;
            found = (dateRange.from <= (_ref = day.key) && _ref <= dateRange.to) ? day : false;
            if (found) {
              if (!selectedMoments[moment.key]) {
                selectedMoments[moment.key] = {
                  key: moment.key,
                  type: 'moment',
                  value: []
                };
              }
              selectedMoments[moment.key].value.push(found);
              contiguousPhotos += found.value.length;
            }
          });
        });
        _selected.moments = _.values(selectedMoments);
        return _selected.contiguousPhotos = contiguousPhotos;
      },
      countContiguousDays: function() {
        return _selected.days;
      },
      getDateRange: function() {
        var selected, selectedDates;
        selected = _data;
        selectedDates = _.pluck(selected, "key");
        selectedDates.sort();
        _selected.dateRange.from = selectedDates[0];
        _selected.dateRange.to = selectedDates[selectedDates.length - 1];
        _selected.days = (new Date(_selected.dateRange.to) - new Date(_selected.dateRange.from)) / (24 * 60 * 60 * 1000) + 1;
        return _selected.dateRange;
      },
      checkout: {
        getSelectedAsMoments: function() {
          self.countContiguousPhotos();
          return {
            selectedMoments: _selected.moments,
            dateRange: _selected.dateRange,
            count: {
              photos: _selected.contiguousPhotos,
              days: _selected.days
            }
          };
        }
      },
      humanize: {
        orderSummary: function(order) {
          var summary;
          summary = {};
          summary.from = new Date(order.checkout.from);
          return summary;
        }
      },
      on: {
        selectByCalendar: function(from, to) {
          _data.push({
            key: from,
            value: []
          });
          _data.push({
            key: to,
            value: []
          });
          return self.getDateRange();
        },
        selectByCameraRollDate: function($ev) {
          var $el, day, remove;
          $el = angular.element($ev.currentTarget);
          day = $el.scope().day;
          if (!self.isDaySelected(day)) {
            _data.push(day);
          } else {
            remove = _.findIndex(_data, (function(o) {
              return o.key === day.key;
            }));
            _data.splice(remove, 1);
          }
          self.countSelectedPhotos();
          self.countContiguousPhotos();
        },
        clearSelected: function() {
          console.log("*** clearSelected!!!");
          _data = [];
          _.extend(_selected, _reset);
        }
      }
    };
    window.debug = _.extend(window.debug || {}, {
      wo: self
    });
    return self;
  }
]).controller('ChooseCtrl', [
  '$scope', '$rootScope', '$state', '$stateParams', '$ionicModal', 'otgData', 'otgWorkOrder', 'TEST_DATA', function($scope, $rootScope, $state, $stateParams, $ionicModal, otgData, otgWorkOrder, TEST_DATA) {
    var init;
    $scope.label = {
      title: "Choose Your Days",
      header_card: {
        'app.choose.calendar': {
          header: "When will you be On-The-Go?",
          body: "Planning a trip? Choose the days you hope to re-live and go capture some beautiful moments. We'll take care of the rest.",
          footer: ""
        },
        'app.choose.camera-roll': {
          header: "When were you On-The-Go?",
          body: "Back home already? Choose the days you want to re-live, and we'll find the beautiful moments in your Camera Roll",
          footer: ""
        }
      }
    };
    $scope.otgWorkOrder = otgWorkOrder;
    $scope.localstate = {
      showDelete: false,
      showReorder: false,
      canSwipe: true
    };
    $scope.getItemHeight = function(moment, index) {
      var days, h, padding, paddingTop;
      days = moment.value.length;
      paddingTop = 10;
      padding = 16 + 1;
      h = days * (56 + 1) + padding * 2;
      return h;
    };
    $scope.hScrollable = function($ev) {
      console.log("hScrollable(): make camera-roll-date H scrollable");
    };
    $scope.controllerScope = _.pick($scope, ['localstate', 'getItemHeight', 'hScrollable']);
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (toState.name.indexOf('app.choose') === 0) {
        if (fromState.name.indexOf('app.checkout') === 0) {
          return console.log("BACK BUTTON DETECTED from checkout????? " + fromState.name + ' > ' + toState.name);
        } else {
          console.log("state.transitionTo: " + fromState.name + ' > ' + toState.name);
          switch (toState.name) {
            case 'app.choose.calendar':
            case 'app.choose.TEST':
              otgWorkOrder.on.clearSelected();
              return otgWorkOrder.on.selectByCalendar("2014-09-20", "2014-09-24");
            case 'app.choose.camera-roll':
              return otgWorkOrder.on.clearSelected();
          }
        }
      }
    });
    init = function() {
      switch ($state.current.name) {
        case 'app.choose.calendar':
          otgWorkOrder.on.clearSelected();
          return otgWorkOrder.on.selectByCalendar("2014-09-20", "2014-09-24");
      }
      window.debug = _.extend(window.debug || {}, {
        state: $state
      });
    };
    $ionicModal.fromTemplateUrl('partials/modal/pricing', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      return $scope.pricelist = modal;
    });
    $scope.$on('$destroy', function() {
      return $scope.pricelist.remove();
    });
    $scope.dontShowHint = function(hide) {
      var current, _ref, _ref1;
      current = $scope.$state.current.name.split('.').pop();
      if (hide) {
        if ((_ref = $scope.config['dont-show-again']['choose']) != null) {
          _ref[current] = true;
        }
      }
      return (_ref1 = $scope.config['dont-show-again']['choose']) != null ? _ref1[current] : void 0;
    };
    return init();
  }
]);
