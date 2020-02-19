(function () {
  'use strict';

  angular
    .module('prestamos')
    .controller('PrestamosController', PrestamosController);

  PrestamosController.$inject = ['$scope', '$state', '$window', 'prestamoResolve', 'PrestamosService', 'Authentication', 'Notification'];

  function PrestamosController($scope, $state, $window, prestamo, PrestamosService, Authentication, Notification) {
    var vm = this;


    vm.prestamo = prestamo;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.date = moment(vm.prestamo.date).format('DD-MM-YYYY HH:mm:ss Z');


    // Get all the users with the role debtor
    vm.debtors = [];

    if (vm.prestamo._id) {
      vm.debtors.push(vm.prestamo.debtor);
    }
    
    var filterDebtors = {
      filter: {
        isAssigned: 0
      }    
    };

    PrestamosService.getDebtors(filterDebtors)
      .then(res => {
        for (var i = 0; i < res.length; i++) {
          vm.debtors.push({
            _id: res[i]._id,
            displayName: res[i].displayName
          });
        }
      })
      .catch(err => console.error(err));

    // Get all the plans
    var optionsPlans = {
      field: ['name'],
      sort: {
        modified: 'desc'
      },
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    PrestamosService.findAllPlans(optionsPlans, function (rst) {
      if(rst) {
        vm.plans = rst.results;
      }
    });
    

    // Remove existing Prestamo
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.prestamo.$remove(function () {
          $state.go('prestamos.list');
          Notification.success({
            message: '<i class="glyphicon glyphicon-ok"></i> Prestamo deleted successfully!'
          });
        });
      }
    }

    // Save Prestamo
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.prestamoForm');
        return false;
      }

      // Create a new prestamo, or update the current instance
      prestamo.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('prestamos.list'); // should we send the User to the list or the updated Prestamo's view?
        Notification.success({
          message: '<i class="glyphicon glyphicon-ok"></i> Prestamo saved successfully!'
        });
      }

      function errorCallback(res) {
        Notification.error({
          message: res.data.message,
          title: '<i class="glyphicon glyphicon-remove"></i> Prestamo save error!'
        });
      }
    }
  }
}());
