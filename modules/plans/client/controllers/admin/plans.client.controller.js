(function () {
  'use strict';

  angular
    .module('plans')
    .controller('PlansController', PlansController);

  PlansController.$inject = ['$scope', '$state', '$window', 'planResolve', 'Authentication', 'Notification'];

  function PlansController($scope, $state, $window, plan, Authentication, Notification) {
    var vm = this;

    vm.plan = plan;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    

    // Remove existing Plan
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.plan.$remove(function () {
          $state.go('plans.list');
          Notification.success({
            message: '<i class="glyphicon glyphicon-ok"></i> Plan deleted successfully!'
          });
        });
      }
    }

    // Save Plan
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.planForm');
        return false;
      }

      // Create a new plan, or update the current instance
      vm.plan.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('plans.list'); // should we send the User to the list or the updated Plan's view?
        Notification.success({
          message: '<i class="glyphicon glyphicon-ok"></i> Plan saved successfully!'
        });
      }

      function errorCallback(res) {
        Notification.error({
          message: res.data.message,
          title: '<i class="glyphicon glyphicon-remove"></i> Plan save error!'
        });
      }
    }
  }
}());
