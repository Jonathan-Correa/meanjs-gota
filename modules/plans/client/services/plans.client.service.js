// Plans service used to communicate Plans REST endpoints
(function () {
  'use strict';

  angular
    .module('plans.services')
    .factory('PlansService', PlansService);

  PlansService.$inject = ['$resource', '$log'];

  function PlansService($resource, $log) {
    var Plans = $resource('/api/plans/:planId', {
      planId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Plans.prototype, {
      createOrUpdate: function () {
        var plan = this;
        return createOrUpdate(plan);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/plans/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      }
    });

    return Plans;

    function createOrUpdate(plan) {
      if (plan._id) {
        return plan.$update(onSuccess, onError);
      } else {
        return plan.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(plan) {
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
