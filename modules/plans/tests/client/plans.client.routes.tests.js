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
          mainstate = $state.get('plans');
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
          liststate = $state.get('plans.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/plans/client/views/list-plans.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          PlansController,
          mockPlan;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('plans.view');
          $templateCache.put('/modules/plans/client/views/view-plan.client.view.html', '');

          // create mock plan
          mockPlan = new PlansService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Plan about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          PlansController = $controller('PlansController as vm', {
            $scope: $scope,
            planResolve: mockPlan
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:planId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.planResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            planId: 1
          })).toEqual('/plans/1');
        }));

        it('should attach an plan to the controller scope', function () {
          expect($scope.vm.plan._id).toBe(mockPlan._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/plans/client/views/view-plan.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/plans/client/views/list-plans.client.view.html', '');

          $state.go('plans.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('plans/');
          $rootScope.$digest();

          expect($location.path()).toBe('/plans');
          expect($state.current.templateUrl).toBe('/modules/plans/client/views/list-plans.client.view.html');
        }));
      });
    });
  });
}());
