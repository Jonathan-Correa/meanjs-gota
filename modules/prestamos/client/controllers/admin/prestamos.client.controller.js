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
    vm.preView = preView;
    vm.save = save;
    vm.preview = {};

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
      .then(function(res){
        for (var i = 0; i < res.length; i++) {
          vm.debtors.push({
            _id: res[i]._id,
            displayName: res[i].displayName
          });
        }
      })
      .catch(function(err){
        console.error(err)
      });

    // Get all the plans
    var optionsPlans = {
      field: ['name', 'interest', 'number_of_fees'],
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


    // PREVIEW
    

    function preView(prestamo){
      console.log(prestamo.amount);
      console.log(prestamo.plan_id.interest);
      vm.preview.agregated_value = (prestamo.amount * prestamo.plan_id.interest) / 100;
      vm.preview.total_to_pay = prestamo.amount + vm.preview.agregated_value;
      vm.preview.value_per_fee = vm.preview.total_to_pay / prestamo.plan_id.number_of_fees;

      console.log(vm.preview);
      console.log(vm.preview);
      console.log(vm.preview);
    }

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

      vm.prestamo.init_date = moment(vm.prestamo.init_date).format();
      vm.prestamo.final_date = moment(vm.prestamo.final_date).format();


      // Create a new prestamo, or update the current instance
      vm.prestamo.createOrUpdate()
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
