(function () {
  'use strict';

  angular
    .module('prestamos')
    .controller('PrestamosListController', PrestamosListController);

  PrestamosListController.$inject = ['PrestamosService'];

  function PrestamosListController(PrestamosService) {
    var vm = this;

    vm.prestamos = PrestamosService.get();
  }
}());
