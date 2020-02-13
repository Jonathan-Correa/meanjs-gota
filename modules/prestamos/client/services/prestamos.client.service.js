// Prestamos service used to communicate Prestamos REST endpoints
(function () {
  'use strict';

  angular
    .module('prestamos.services')
    .factory('PrestamosService', PrestamosService);

  PrestamosService.$inject = ['$resource', '$log'];

  function PrestamosService($resource, $log) {
    var Article = $resource('/api/prestamos/:prestamoId', {
      prestamoId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Article.prototype, {
      createOrUpdate: function () {
        var prestamo = this;
        return createOrUpdate(prestamo);
      }
    });

    return Article;

    function createOrUpdate(prestamo) {
      if (prestamo._id) {
        return prestamo.$update(onSuccess, onError);
      } else {
        return prestamo.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(prestamo) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());