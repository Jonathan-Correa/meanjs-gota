(function () {
  'use strict';

  angular
    .module('plans.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('plans', {
        abstract: true,
        url: '/plans',
        template: '<ui-view/>'
      })
      .state('plans.list', {
        url: '',
        templateUrl: '/modules/plans/client/views/admin/list-plans.client.view.html',
        controller: 'PlansListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          plansResolve: getPlans
        }
      })
      .state('plans.create', {
        url: '/create',
        templateUrl: '/modules/plans/client/views/admin/form-plan.client.view.html',
        controller: 'PlansController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          planResolve: newPlan
        }
      })
      .state('plans.edit', {
        url: '/:planId/edit',
        templateUrl: '/modules/plans/client/views/admin/form-plan.client.view.html',
        controller: 'PlansController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ planResolve.title }}'
        },
        resolve: {
          planResolve: getPlan
        }
      })
      .state('plans.view', {
        url: '/:planId',
        templateUrl: '/modules/plans/client/views/admin/view-plan.client.view.html',
        controller: 'PlansController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ planResolve.title }}'
        },
        resolve: {
          planResolve: getPlan
        }
      });
  }

  getPlan.$inject = ['$stateParams', 'PlansService'];

  function getPlan($stateParams, PlansService) {
    return PlansService.get({
      planId: $stateParams.planId
    }).$promise;
  }

  getPlans.$inject = ['$stateParams', 'PlansService'];

  function getPlans($stateParams, PlansService) {
    var filterPlansService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return PlansService.get(filterPlansService).$promise;
  }

  newPlan.$inject = ['PlansService'];

  function newPlan(PlansService) {
    return new PlansService();
  }
}());
