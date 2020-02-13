(function () {
  'use strict';

  angular
    .module('prestamos.admin')
    .controller('PrestamosAdminListController', PrestamosAdminListController);

  PrestamosAdminListController.$inject = ['PrestamosService'];

  function PrestamosAdminListController(PrestamosService) {
    var vm = this;

    vm.prestamos = PrestamosService.get();
  }
}());
