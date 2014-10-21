'use strict';

/**
  * @ngdoc function
  * @name ionBlankApp.controller:SettingsCtrl
  * @description
  * # SettingsCtrl
  * Controller of the ionBlankApp
 */
angular.module('ionBlankApp').controller('SettingsCtrl', [
  '$scope', '$ionicNavBarDelegate', function($scope, $ionicNavBarDelegate) {
    var email, init, password;
    $scope.label = {
      title: "Settings",
      subtitle: "Share something great today!"
    };
    $scope.password = password = {
      minLength: 3,
      changing: !$scope.user.username,
      passwordAgain: null,
      old: null,
      change: function(ev) {
        if (password.changing) {
          return password.revert(ev);
        }
        console.log("click: " + ev.target);
        password.changing = true;
        password.old = $scope.user.password;
        return $scope.user.password = null;
      },
      revert: function(ev) {
        if (password.changing === false) {
          return;
        }
        $scope.user.password = password.old;
        password.old = password.passwordAgain = null;
        password.changing = false;
        return ev.target.blur();
      },
      commit: function(ev) {
        if (password.isValid() && password.isConfirmed()) {
          password.changing = false;
          password.passwordAgain = null;
          return ev.target.blur();
        } else {
          return false;
        }
      },
      isValid: function() {
        var _ref;
        return ((_ref = $scope.user.password) != null ? _ref.length : void 0) >= password.minLength;
      },
      isConfirmed: function() {
        return password.isValid() && password.passwordAgain === $scope.user.password;
      }
    };
    $scope.email = email = {
      changing: false,
      old: null,
      oldVerified: null,
      change: function(ev) {
        if (email.changing) {
          return email.revert(ev);
        }
        email.changing = true;
        email.old = $scope.user.email;
        email.oldVerified = $scope.user.emailVerified;
        $scope.user.email = null;
        return $scope.user.emailVerified = false;
      },
      revert: function(ev) {
        if (email.changing === false) {
          return;
        }
        $scope.user.email = email.old;
        $scope.user.emailVerified = email.oldVerified;
        email.old = email.oldVerified = null;
        email.changing = false;
        return ev.target.blur();
      },
      commit: function(ev) {
        if (email.isValid()) {
          return email.changing = false;
        } else {
          return false;
        }
      },
      isValid: function() {
        var _ref;
        return (_ref = $scope.user.email) != null ? _ref.length : void 0;
      },
      isVerified: function() {
        return $scope.user.emailVerified;
      }
    };
    init = function() {
      $scope.isAnonymous = !$scope.user.username;
    };
    return init();
  }
]);
