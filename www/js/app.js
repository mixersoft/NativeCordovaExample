'use strict';

/**
  * @ngdoc overview
  * @name ionBlankApp
  * @description
  * # ionBlankApp
  *
  * Main module of the application.
 */
angular.module('ionBlankApp', ['ionic', 'ionBlankApp.controllers']).constant('version', '0.0.1').run([
  '$rootScope', '$state', '$stateParams', '$ionicPlatform', function($rootScope, $state, $stateParams, $ionicPlatform) {
    $ionicPlatform.ready(function() {
      var _ref;
      if ((_ref = window.cordova) != null ? _ref.plugins.Keyboard : void 0) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar != null) {
        return StatusBar.styleDefault();
      }
    });
    $rootScope.$state = $state;
    return $rootScope.$stateParams = $stateParams;
  }
]).config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('app', {
    url: "/app",
    abstract: true,
    views: {
      'appContent': {
        templateUrl: "views/menu.html",
        controller: 'AppCtrl'
      },
      'appPartials': {
        templateUrl: "views/template/app-partials.html"
      }
    }
  }).state('app.top-picks', {
    url: "/top-picks",
    views: {
      'menuContent': {
        templateUrl: "views/top-picks.html",
        controller: 'TopPicksCtrl'
      }
    }
  }).state('app.top-picks.favorites', {
    url: "/favorites"
  }).state('app.top-picks.shared', {
    url: "/shared"
  }).state('app.choose', {
    url: "/choose",
    abstract: true,
    views: {
      'menuContent': {
        templateUrl: "views/choose.html",
        controller: 'ChooseCtrl'
      }
    }
  }).state('app.choose.calendar', {
    url: "/calendar",
    views: {
      'chooseCalendar': {
        templateUrl: "views/choose-calendar.html"
      }
    }
  }).state('app.choose.camera-roll', {
    url: "/camera-roll",
    views: {
      'chooseCameraRoll': {
        templateUrl: "views/choose-camera-roll.html"
      }
    }
  }).state('app.checkout', {
    url: "/checkout",
    abstract: true,
    views: {
      'menuContent': {
        templateUrl: "views/checkout.html",
        controller: 'CheckoutCtrl'
      }
    }
  }).state('app.checkout.order-detail', {
    url: "/order-detail/:from",
    views: {
      'checkoutContent': {
        templateUrl: "views/checkout-order-detail.html"
      }
    }
  }).state('app.checkout.payment', {
    url: "/payment",
    views: {
      'checkoutContent': {
        templateUrl: "partials/checkout/payment"
      }
    }
  }).state('app.checkout.sign-up', {
    url: "/sign-up",
    views: {
      'checkoutContent': {
        templateUrl: "views/checkout-user.html"
      }
    }
  }).state('app.checkout.terms-of-service', {
    url: "/terms-of-service",
    views: {
      'checkoutContent': {
        templateUrl: "views/checkout-user.html"
      }
    }
  }).state('app.checkout.submit', {
    url: "/submit",
    views: {
      'checkoutContent': {
        templateUrl: "partials/checkout/submit"
      }
    }
  }).state('app.checkout.complete', {
    url: "/complete",
    views: {
      'checkoutContent': {
        templateUrl: "partials/checkout/complete"
      }
    }
  }).state('app.orders', {
    url: "/orders",
    views: {
      'menuContent': {
        templateUrl: "views/orders.html",
        controller: 'OrdersCtrl'
      }
    }
  }).state('app.orders.detail', {
    url: "/:oid",
    views: {
      'menuContent': {
        templateUrl: "views/orders.html",
        controller: 'OrdersCtrl'
      }
    }
  }).state('app.uploader', {
    url: "/uploader",
    views: {
      'menuContent': {
        templateUrl: "views/upload.html",
        controller: 'UploadCtrl'
      }
    }
  }).state('app.settings', {
    url: "/settings",
    abstract: true,
    views: {
      'menuContent': {
        template: '<ion-view title="Settngs" hide-back-button="true" ><ion-nav-view name="settingsContent" animation="slide-left-right"></ion-nav-view></ion-view>',
        controller: 'SettingsCtrl'
      }
    }
  }).state('app.settings.main', {
    url: "",
    views: {
      'settingsContent': {
        templateUrl: "views/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  }).state('app.settings.profile', {
    url: "/profile",
    views: {
      'settingsContent': {
        templateUrl: "views/settings-profile.html",
        controller: 'SettingsCtrl'
      }
    }
  }).state('app.settings.terms-of-service', {
    url: "/terms-of-service",
    views: {
      'settingsContent': {
        templateUrl: "views/settings-tos.html",
        controller: 'SettingsCtrl'
      }
    }
  }).state('app.help', {
    url: "/help",
    abstract: true,
    views: {
      'menuContent': {
        template: '<ion-view title="Help" hide-back-button="true" ><ion-nav-view name="helpContent" animation="slide-left-right"></ion-nav-view></ion-view>',
        controller: 'HelpCtrl'
      }
    }
  }).state('app.help.main', {
    url: "",
    views: {
      'helpContent': {
        templateUrl: "views/help.html"
      }
    }
  }).state('app.help.welcome', {
    url: "/welcome",
    views: {
      'helpContent': {
        templateUrl: "help/welcome"
      }
    }
  }).state('app.help.pricing', {
    url: "/pricing",
    views: {
      'helpContent': {
        templateUrl: "help/pricing"
      }
    }
  }).state('app.help.about', {
    url: "/about",
    views: {
      'helpContent': {
        templateUrl: "views/help/about.html"
      }
    }
  });
  return $urlRouterProvider.otherwise('/app/top-picks');
}).controller('AppCtrl', [
  '$scope', '$ionicModal', '$timeout', 'otgData', 'otgWorkOrder', 'TEST_DATA', function($scope, $ionicModal, $timeout, otgData, otgWorkOrder, TEST_DATA) {
    var cameraRoll_DATA, init;
    $scope.loginData = {};
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      return $scope.modal = modal;
    });
    $scope.closeLogin = function() {
      return $scope.modal.hide();
    };
    $scope.login = function() {
      return $scope.modal.show();
    };
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);
      return $timeout(function() {
        return $scope.closeLogin();
      }, 1000);
    };
    $scope.toggleHelp = function() {
      $scope.config.help = !$scope.config.help;
      return console.log("help=" + ($scope.config.help ? 'ON' : 'OFF'));
    };
    $scope.menu = {
      top_picks: {
        count: '?'
      },
      archived: {
        count: 0
      }
    };
    $scope.config = {
      help: false,
      privacy: {
        'only-mothers': false
      },
      upload: {
        'auto-upload': false,
        'use-cellular-data': false,
        'use-720p-service': true,
        'rate-control': 80
      },
      archive: {
        'copy-top-picks': false,
        'copy-favorites': true
      },
      sharing: {
        'use-720p-sharing': false
      },
      'dont-show-again': {
        'top-picks': {
          'top-picks': false,
          'favorite': false,
          'shared': false
        },
        choose: {
          'camera-roll': false,
          calendar: false
        }
      }
    };
    $scope.user = {
      id: null,
      username: null,
      password: null,
      email: null,
      emailVerified: false,
      tos: false,
      rememberMe: false
    };
    $scope.orders = [];
    $scope.cameraRoll_DATA = cameraRoll_DATA = {
      photos_ByDate: TEST_DATA.cameraRoll_byDate,
      moments: null,
      photos: null
    };
    $scope.$watch('config', function(newVal, oldVal) {
      var fail, ok, okAlert, prefs;
      prefs = plugins.appPreferences;
      ok = function(value) {
        console.log("SUCCESS: value=" + JSON.stringify(value));
        prefs.fetch(okAlert, fail, 'prefs');
      };
      okAlert = function(value) {
        alert("SUCCESS: value=" + JSON.stringify(value));
      };
      fail = function(err) {
        console.warn("FAIL: error=" + JSON.stringify(err));
      };
      return prefs.store(ok, fail, 'prefs', newVal);
    }, true);
    init = function() {
      cameraRoll_DATA.photos_ByDate = TEST_DATA.cameraRoll_byDate;
      cameraRoll_DATA.moments = otgData.orderMomentsByDescendingKey(otgData.parseMomentsFromCameraRollByDate(cameraRoll_DATA.photos_ByDate), 2);
      cameraRoll_DATA.photos = otgData.parsePhotosFromMoments(cameraRoll_DATA.moments);
      otgWorkOrder.setMoments(cameraRoll_DATA.moments);
      return $scope.orders = TEST_DATA.orders;
    };
    init();
    return window.debug = _.extend(window.debug || {}, {
      user: $scope.user,
      moments: cameraRoll_DATA.moments,
      orders: $scope.orders
    });
  }
]);
