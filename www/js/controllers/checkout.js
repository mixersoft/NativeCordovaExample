'use strict';

/**
  * @ngdoc function
  * @name ionBlankApp.controller:ChooseCtrl
  * @description
  * # ChooseCtrl
  * Controller of the ionBlankApp
 */
angular.module('ionBlankApp').controller('CheckoutCtrl', [
  '$scope', '$rootScope', '$state', '$stateParams', '$ionicNavBarDelegate', '$ionicModal', 'otgData', 'otgWorkOrder', 'otgUploader', 'TEST_DATA', function($scope, $rootScope, $state, $stateParams, $ionicNavBarDelegate, $ionicModal, otgData, otgWorkOrder, otgUploader, TEST_DATA) {
    var init, _applyPromoCode, _getTotal, _queueSelectedMoments, _wizard;
    $scope.label = {
      title: "Checkout",
      header_card: {
        'order-detail+app.choose.camera-roll': {
          header: "Order Details",
          body: "These are the days you will have us scan:",
          footer: ""
        },
        'order-detail+app.choose.calendar': {
          header: "Order Details",
          body: "Bon voyage! Have a great trip! It's so exciting to be On-The-Go - don't forget to snap a lot of photos. We'll keep an eye out for anything photos you take on these days: ",
          footer: ""
        },
        'payment': {
          header: "Payment",
          body: "",
          footer: ""
        },
        'sign-up': {
          header: "Sign-up"
        },
        'terms-of-service': {
          header: "Terms of Service"
        },
        'submit': {
          header: "Review",
          body: "Please review your order below",
          footer: ""
        },
        'complete': {
          header: "What Happens Next?",
          body: "",
          footer: ""
        }
      }
    };
    $scope.otgWorkOrder = otgWorkOrder;
    _wizard = {
      doneState: 'app.uploader',
      steps: ['from', 'order-detail', 'payment', 'sign-up', 'terms-of-service', 'submit', 'complete'],
      from: function(from) {
        return _wizard.steps[0] = from;
      },
      validateSteps: function() {
        if (!!$scope.user.username && _wizard.steps.indexOf('sign-up') > -1) {
          _wizard.steps.splice(_wizard.steps.indexOf('sign-up'), 1);
        }
        if (!!$scope.user.tos && _wizard.steps.indexOf('terms-of-service') > -1) {
          _wizard.steps.splice(_wizard.steps.indexOf('terms-of-service'), 1);
        }
        return _wizard.steps;
      },
      goto: function(dir, params) {
        var current, ex, incr, steps, target;
        if (params == null) {
          params = null;
        }
        steps = _wizard.steps;
        current = $state.current.name.split('.').pop();
        try {
          incr = dir === 'next' ? 1 : dir === 'prev' ? -1 : _.isNumeric(dir) ? dir : 0;
          target = steps[steps.indexOf(current) + incr];
          if (target === steps[0]) {
            $state.go(target);
          } else {
            $state.go('^.' + target, params);
          }
        } catch (_error) {
          ex = _error;
          if (!target && current === _wizard.steps[_wizard.steps.length - 1]) {
            $state.go(_wizard.doneState);
          } else {
            console.error("ERROR: invalid state transition in checkout, target=" + target);
          }
        }
      }
    };
    $scope.on = {
      back: function(params) {
        return $ionicNavBarDelegate.back();
      },
      next: function(params) {
        if (!$scope.on.beforeNextStep()) {
          return;
        }
        return _wizard.goto('next', params);
      },
      getOrderType: function() {
        var from;
        from = _wizard.steps[0].split('.').pop();
        if (!from || from === 'from') {
          return 'camera-roll';
        } else {
          return from;
        }
      },
      getHeaderCard: function() {
        var header, step, target;
        step = $state.current.name.split('.').pop();
        if (step === 'order-detail') {
          target = _wizard.steps[1] + '+' + _wizard.steps[0];
          header = $scope.label.header_card[target];
        } else {
          header = $scope.label.header_card[step];
        }
        return header;
      },
      currentState: function() {
        console.log($state.current.name);
        return $state.current.name;
      },
      beforeNextStep: function() {
        switch ($state.current.name) {
          case 'app.checkout.terms-of-service':
            if (!$scope.user.tos) {
              return false;
            }
            break;
          case 'app.checkout.submit':
            $scope.orders.push({
              datetime: new Date(),
              status: 'new',
              checkout: $scope.checkout,
              servicePlan: $scope.watch.servicePlan
            });
            break;
          case 'app.checkout.complete':
            $ionicNavBarDelegate.showBackButton(false);
        }
        return true;
      },
      afterNextStep: function() {
        switch ($state.current.name) {
          case 'app.checkout.complete':
            _queueSelectedMoments($scope.checkout.selectedMoments);
        }
        return true;
      },
      getPromoCode: function() {
        $scope.watch.promoCode = "3DAYSFREE";
        return _applyPromoCode($scope.watch.promoCode, $scope.watch.servicePlan);
      }
    };
    $scope.watch = {
      promoCode: '',
      servicePlan: null
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
    _getTotal = function(checkout) {
      var months, remainder, servicePlan, total;
      if (!checkout) {
        checkout = $scope.checkout;
      }
      servicePlan = {
        total: 0,
        plans: []
      };
      if ($state.params.from === 'app.choose.camera-roll' && checkout.count.photos <= 100) {
        servicePlan.total = 1;
        servicePlan.plans.push('First 100 Photos');
        return servicePlan;
      }
      total = 0;
      months = Math.floor(checkout.count.days / 30);
      if (months) {
        total = months * 10;
        servicePlan.plans.push('$10/month for ' + months + ' months');
      }
      remainder = checkout.count.days % 30;
      if (remainder <= 5) {
        total += remainder * 1;
        servicePlan.plans.push('$1/day for ' + remainder + ' days');
      } else if (remainder <= 7) {
        total += 5;
        servicePlan.plans.push('$5/week for 1 week');
      } else if (remainder <= 11) {
        total += 5 + (remainder - 7) * 1;
        servicePlan.plans.push('$5/week for 1 week');
        servicePlan.plans.push('$1/day for ' + (remainder - 7) + ' days');
      } else if (remainder <= 30) {
        total += 10;
        if (months) {
          servicePlan.plans[0]('$10/month for ' + (months + 1) + ' months');
        } else {
          servicePlan.plans.push('$10/month for 1 month');
        }
      }
      servicePlan.total = total;
      return servicePlan;
    };
    _applyPromoCode = function(promoCode, servicePlan) {
      switch (promoCode) {
        case '3DAYSFREE':
          if (servicePlan.plans.indexOf("Promo Code: " + promoCode) > -1) {
            return;
          }
          servicePlan.plans.push('Promo Code: ' + promoCode);
          return servicePlan.total = Math.max(servicePlan.total - 3, 0);
      }
    };
    _queueSelectedMoments = function(moments) {
      otgUploader.queue(moments);
    };
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (/^app.checkout/.test(toState.name) && /^app.checkout/.test(fromState.name)) {
        $scope.headerCard = $scope.on.getHeaderCard();
      }
      if (/^app.checkout/.test(toState.name)) {
        return $scope.on.afterNextStep();
      }
    });
    init = function() {
      var target;
      console.log("init: state=" + $state.current.name);
      $scope.checkout = otgWorkOrder.checkout.getSelectedAsMoments();
      $scope.watch.servicePlan = _getTotal($scope.checkout);
      _wizard.validateSteps();
      $scope.$state = $state;
      if ($state.params.from != null) {
        _wizard.from($state.params.from);
      }
      if (!otgWorkOrder.isSelected()) {
        target = 'app.choose.' + $scope.on.getOrderType();
        console.log("WARNING: checkout with no days selected!! redirecting, from=" + target);
        return $state.transitionTo(target);
      }
      $scope.headerCard = $scope.on.getHeaderCard();
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
    init();
    return window.debug = _.extend(window.debug || {}, {
      watch: $scope.watch,
      checkout: $scope.checkout
    });
  }
]);
