(function () {
  'use strict';

  angular
    .module('prestamos.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.prestamos', {
        abstract: true,
        url: '/prestamos',
        template: '<ui-view/>'
      })
      .state('admin.prestamos.list', {
        url: '',
        templateUrl: '/modules/prestamos/client/views/admin/list-prestamos.client.view.html',
        controller: 'PrestamosAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'debtor']
        }
      })
      .state('admin.prestamos.create', {
        url: '/create',
        templateUrl: '/modules/prestamos/client/views/admin/form-prestamo.client.view.html',
        controller: 'PrestamosAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          prestamoResolve: newPrestamo
        }
      })
      .state('admin.prestamos.edit', {
        url: '/:prestamoId/edit',
        templateUrl: '/modules/prestamos/client/views/admin/form-prestamo.client.view.html',
        controller: 'PrestamosAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ prestamoResolve.title }}'
        },
        resolve: {
          prestamoResolve: getPrestamo
        }
      });
  }

  getPrestamo.$inject = ['$stateParams', 'PrestamosService'];

  function getPrestamo($stateParams, PrestamosService) {
    return PrestamosService.get({
      prestamoId: $stateParams.prestamoId
    }).$promise;
  }

  newPrestamo.$inject = ['PrestamosService'];

  function newPrestamo(PrestamosService) {
    return new PrestamosService();
  }
}());
