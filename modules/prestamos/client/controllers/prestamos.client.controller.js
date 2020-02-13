(function () {
  'use strict';

  angular
    .module('prestamos')
    .controller('PrestamosController', PrestamosController);

  PrestamosController.$inject = ['$scope', 'prestamoResolve', 'Authentication'];

  function PrestamosController($scope, prestamo, Authentication) {
    var vm = this;

    vm.prestamo = prestamo;
    vm.authentication = Authentication;

  }
}());
