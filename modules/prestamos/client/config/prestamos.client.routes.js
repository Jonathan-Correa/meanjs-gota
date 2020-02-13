(function () {
  'use strict';

  angular
    .module('prestamos.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('prestamos', {
        abstract: true,
        url: '/prestamos',
        template: '<ui-view/>'
      })
      .state('prestamos.list', {
        url: '',
        templateUrl: '/modules/prestamos/client/views/list-prestamos.client.view.html',
        controller: 'PrestamosListController',
        controllerAs: 'vm'
      })
      .state('prestamos.view', {
        url: '/:prestamoId',
        templateUrl: '/modules/prestamos/client/views/view-prestamo.client.view.html',
        controller: 'PrestamosController',
        controllerAs: 'vm',
        resolve: {
          prestamoResolve: getPrestamo
        },
        data: {
          pageTitle: '{{ prestamoResolve.title }}'
        }
      });
  }

  getPrestamo.$inject = ['$stateParams', 'PrestamosService'];

  function getPrestamo($stateParams, PrestamosService) {
    return PrestamosService.get({
      prestamoId: $stateParams.prestamoId
    }).$promise;
  }
}());
