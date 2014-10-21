'use strict';

/**
  * @ngdoc function
  * @name ionBlankApp.controller:UploadCtrl
  * @description
  * # UploadCtrl
  * Controller of the ionBlankApp
 */
angular.module('ionBlankApp').factory('otgUploader', [
  '$timeout', 'otgData', function($timeout, otgData) {
    var self;
    self = {
      _queue: [],
      state: {
        isActive: false,
        isEnabled: null
      },
      enable: function(action) {
        if (action == null) {
          action = null;
        }
        if (action === 'toggle') {
          return this.state.isEnabled = !this.state.isEnabled;
        } else if (action !== null) {
          return this.state.isEnabled = !!action;
        } else {
          return this.state.isEnabled;
        }
      },
      isActive: function() {
        return self.state.isActive;
      },
      startUploading: function(count) {
        var i, _i;
        if (count == null) {
          count = 0;
        }
        if (count && _.isNumber(count)) {
          for (i = _i = 0; 0 <= count ? _i <= count : _i >= count; i = 0 <= count ? ++_i : --_i) {
            self._queue.push(i);
          }
        }
        if (self.state.isEnabled && self._queue.length) {
          if (count !== 'toggle') {
            self.state.isActive = true;
          }
          return $timeout(function() {
            self._queue.shift();
            self.state.isActive = !self.state.isActive && self._queue.length;
            return self.startUploading('toggle');
          }, 500);
        } else if (!self.state.isEnabled || self._queue.length) {
          return self.state.isActive = false;
        }
      },
      isQueued: function() {
        return !!self.queueLength();
      },
      queueLength: function() {
        var _ref;
        return ((_ref = self._queue) != null ? _ref.length : void 0) || 0;
      },
      queue: function(momentsOrPhotos) {
        var photos, _ref, _ref1;
        if (!_.isArray(momentsOrPhotos)) {
          throw "ERROR: expecting an array of moments or photos";
        }
        if (((_ref = momentsOrPhotos[0]) != null ? _ref.type : void 0) === 'moment') {
          photos = otgData.parsePhotosFromMoments(momentsOrPhotos);
        } else if (((_ref1 = momentsOrPhotos[0]) != null ? _ref1.id : void 0) != null) {
          photos = momentsOrPhotos;
        } else if (_.isString(momentsOrPhotos[0])) {
          photos = momentsOrPhotos;
        }
        _.each(photos, function(photo) {
          return self._queue.push(photo.id);
        });
      }
    };
    return self;
  }
]).controller('UploadCtrl', [
  '$scope', '$timeout', 'otgUploader', function($scope, $timeout, otgUploader) {
    var init;
    $scope.label = {
      title: "Upload"
    };
    $scope.otgUploader = otgUploader;
    $scope.redButton = {
      press: function(ev) {
        var target;
        target = angular.element(ev.currentTarget);
        target.addClass('activated');
        if (otgUploader.enable('toggle')) {
          target.addClass('enabled');
          otgUploader.startUploading();
        } else {
          target.removeClass('enabled');
        }
      },
      release: function(ev) {
        var target;
        target = angular.element(ev.currentTarget);
        target.removeClass('activated');
        if (otgUploader.enable()) {
          target.removeClass('enabled');
        }
      },
      demo: function(ev) {
        otgUploader.enable(true);
        return otgUploader.startUploading(9);
      }
    };
    init = function() {
      if (otgUploader.enable() === null) {
        return otgUploader.enable($scope.config.upload['auto-upload']);
      }
    };
    return init();
  }
]);
