(function () {
  'use strict';

  angular
    .module('plans')
    .controller('PlansListController', PlansListController);

  PlansListController.$inject = ['$scope', '$state', '$window', 'plansResolve', 'PlansService', 'NgTableParams', 'Notification'];

  function PlansListController($scope, $state, $window, plans, PlansService, NgTableParams, Notification) {
    // debugger;
    var vm = this;
    vm.plans = plans;

    vm.remove = remove;
    vm.isEditing = false;
    
    vm.cols = [
      {
        field: 'name',
        title: 'Name',
        filter: {
          content: 'text'
        },
        sortable: 'name',
        dataType: 'text'
      },
      {
        field: 'periodicity',
        title: 'Periodicity',
        filter: {
          content: 'text'
        },
        sortable: 'periodicity',
        dataType: 'text'
      },
      {
        field: 'interest',
        title: 'Interest',
        filter: {
          content: 'text'
        },
        sortable: 'interest',
        dataType: 'text'
      },
      {
        field: 'action',
        title: 'Actions',
        dataType: 'command'
      }
    ];

    var initialParams = {
      page: 1,
      count: 5,
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    var initialSettings = {
      counts: [5, 10, 15],
      getData: function (params) {
        return PlansService.get(params.parameters()).$promise.then(function(rstPlansService) {
          params.total(rstPlansService.total);
          return rstPlansService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    // Remove existing Plan
    function remove(id) {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.plans.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.error({
              message: '<i class="fas fa-trash-alt"></i> Plan deleted fail!'
            });
            return false;
          }
          vm.tableParams.reload().then(function(data) {
            if (data.length === 0 && vm.tableParams.total() > 0) {
              vm.tableParams.page(vm.tableParams.page() - 1);
              vm.tableParams.reload();
            }
          });
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> Plan deleted successfully!'
          });
        });
      }
    }
  }
}());
