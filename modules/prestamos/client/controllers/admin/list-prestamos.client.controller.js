(function () {
  'use strict';

  angular
    .module('prestamos')
    .controller('PrestamosListController', PrestamosListController);

  PrestamosListController.$inject = ['$state', '$window', 'prestamosResolve', 'PrestamosService', 'NgTableParams', 'Authentication', 'Notification'];

  function PrestamosListController($state, $window, prestamos, PrestamosService, NgTableParams, Authentication, Notification) {
    // debugger;
    var vm = this;
    vm.prestamos = prestamos;

    vm.remove = remove;
    vm.isEditing = false;
    
    vm.listCreatedBy = [];
    vm.listDebtors = [];

    vm.showButton = Authentication.user.roles.includes('admin') ? true : false; 

    
    vm.cols = [
      {
        field: 'createdBy',
        title: 'Created By',
        filter: {
          createdBy: 'text'
        },
        sortable: 'createdBy',
        dataType: 'text'
      },
      {
        field: 'debtor',
        title: 'Debtor',
        filter: {
          content: 'text'
        },
        sortable: 'debtor',
        dataType: 'text'
      },
      {
        field: 'amount',
        title: 'Amount',
        filter: {
          content: 'text'
        },
        sortable: 'amount',
        dataType: 'text'
      },
      {
        field: 'plan_id',
        title: 'Plan',
        filter: {
          content: 'select'
        },
        sortable: 'plan_id',
        dataType: 'text'
      },
      {
        field: 'date',
        title: 'Date',
        filter: {
          content: 'text'
        },
        sortable: 'date',
        dataType: 'text'
      },
      {
        field: 'address',
        title: 'Address',
        filter: {
          content: 'text'
        },
        sortable: 'address',
        dataType: 'text'
      },
      {
        field: 'action',
        title: 'actions',
        dataType: 'command'
      }
    ];

    var initialParams = {
      page: 1,
      count: 5,
      populate: [
        {
          path: 'createdBy',
          select: 'displayName'
        },
        {
          path: 'debtor',
          select: 'displayName'
        },
        {
          path: 'plan_id',
          select: 'name'
        },
        {
          path: 'debtor',
          select: 'address'
        }
      ]
    };

    var initialSettings = {
      counts: [5, 10, 15],
      getData: function (params) {
        return PrestamosService.get(params.parameters()).$promise.then(function(rstPrestamosService) {
          params.total(rstPrestamosService.total);
          return rstPrestamosService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    // Remove existing Prestamo
    function remove(id) {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.prestamos.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.error({
              message: '<i class="fas fa-trash-alt"></i> Prestamo deleted fail!'
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
            message: '<i class="far fa-thumbs-up"></i> Prestamo deleted successfully!'
          });
        });
      }
    }
  }
}());
