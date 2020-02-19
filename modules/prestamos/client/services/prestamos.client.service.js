// Prestamos service used to communicate Prestamos REST endpoints
(function () {
  'use strict';

  angular
    .module('prestamos.services')
    .factory('PrestamosService', PrestamosService);

  PrestamosService.$inject = ['$resource', '$log'];

  function PrestamosService($resource, $log) {
    var Prestamos = $resource('/api/prestamos/:prestamoId', {
      prestamoId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Prestamos.prototype, {
      createOrUpdate: function () {
        var prestamo = this;
        return createOrUpdate(prestamo);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/prestamos/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      }
    });

    angular.extend(Prestamos, {
      getDebtors : function (params){
        var modules = $resource('/api/users/getDebtors');
        return modules.query(params).$promise;
      },
      findAllPlans: function (params, callback) {
        var modules = $resource('/api/plans', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      }
    });

    return Prestamos;

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
