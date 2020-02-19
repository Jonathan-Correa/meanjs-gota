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
        templateUrl: '/modules/prestamos/client/views/admin/list-prestamos.client.view.html',
        controller: 'PrestamosListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          prestamosResolve: getPrestamos
        }
      })
      .state('prestamos.create', {
        url: '/create',
        templateUrl: '/modules/prestamos/client/views/admin/form-prestamo.client.view.html',
        controller: 'PrestamosController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          prestamoResolve: newPrestamo
        }
      })
      .state('prestamos.edit', {
        url: '/:prestamoId/edit',
        templateUrl: '/modules/prestamos/client/views/admin/form-prestamo.client.view.html',
        controller: 'PrestamosController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ prestamoResolve.title }}'
        },
        resolve: {
          prestamoResolve: getPrestamo
        }
      })
      .state('prestamos.view', {
        url: '/:prestamoId',
        templateUrl: '/modules/prestamos/client/views/admin/view-prestamo.client.view.html',
        controller: 'PrestamosController',
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
      prestamoId: $stateParams.prestamoId,
      populate: {
        path: 'createdBy debtor',
        field: 'displayName displayName'
      }
    }).$promise;
  }

  getPrestamos.$inject = ['$stateParams', 'PrestamosService'];

  function getPrestamos($stateParams, PrestamosService) {
    var filterPrestamosService = {
      count: 1,
      page: 1,
    };
    return PrestamosService.get(filterPrestamosService).$promise;
  }

  newPrestamo.$inject = ['PrestamosService'];

  function newPrestamo(PrestamosService) {
    return new PrestamosService();
  }
}());
