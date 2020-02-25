(function () {
  'use strict';

  angular
    .module('prestamos.admin')
    .controller('PrestamosAdminController', PrestamosAdminController);

  PrestamosAdminController.$inject = ['$scope', '$state', '$window', 'prestamoResolve', 'PrestamosService', 'Authentication', 'Notification'];

  function PrestamosAdminController($scope, $state, $window, prestamo, PrestamosService, Authentication, Notification) {
    var vm = this;
    vm.prestamo = prestamo;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Prestamo
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.prestamo.$remove(function () {
          $state.go('admin.prestamos.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Prestamo deleted successfully!' });
        });
      }
    }

    vm.debtors = [];

    PrestamosService.getDebtors()
      .then(function(res) {
        for (var i = 0; i < res.length; i++) {
          vm.debtors.push(res[i]);
        }
      })
      .catch(function(err){
        console.error(err); 
      });

    // Save Prestamo
    function save(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.prestamoForm');
        return false;
      }

      // Create a new prestamo, or update the current instance
      vm.prestamo.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.prestamos.list'); // should we send the User to the list or the updated Prestamo's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Prestamo saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Prestamo save error!' });
      }
    }
  }
}());
