(function () {
  'use strict';

  describe('Plans Route Tests', function () {
    // Initialize global variables
    var $scope,
      PlansService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _PlansService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      PlansService = _PlansService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.plans');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/plans');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('admin.plans.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/plans/client/views/admin/list-plans.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          PlansAdminController,
          mockPlan;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.plans.create');
          $templateCache.put('/modules/plans/client/views/admin/form-plan.client.view.html', '');

          // Create mock plan
          mockPlan = new PlansService();

          // Initialize Controller
          PlansAdminController = $controller('PlansAdminController as vm', {
            $scope: $scope,
            planResolve: mockPlan
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.planResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/plans/create');
        }));

        it('should attach an plan to the controller scope', function () {
          expect($scope.vm.plan._id).toBe(mockPlan._id);
          expect($scope.vm.plan._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('/modules/plans/client/views/admin/form-plan.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          PlansAdminController,
          mockPlan;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.plans.edit');
          $templateCache.put('/modules/plans/client/views/admin/form-plan.client.view.html', '');

          // Create mock plan
          mockPlan = new PlansService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Plan about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          PlansAdminController = $controller('PlansAdminController as vm', {
            $scope: $scope,
            planResolve: mockPlan
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:planId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.planResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            planId: 1
          })).toEqual('/admin/plans/1/edit');
        }));

        it('should attach an plan to the controller scope', function () {
          expect($scope.vm.plan._id).toBe(mockPlan._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('/modules/plans/client/views/admin/form-plan.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
