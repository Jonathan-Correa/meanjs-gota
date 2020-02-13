(function () {
  'use strict';

  describe('Prestamos Route Tests', function () {
    // Initialize global variables
    var $scope,
      PrestamosService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _PrestamosService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      PrestamosService = _PrestamosService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('prestamos');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/prestamos');
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
          liststate = $state.get('prestamos.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/prestamos/client/views/list-prestamos.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          PrestamosController,
          mockPrestamo;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('prestamos.view');
          $templateCache.put('/modules/prestamos/client/views/view-prestamo.client.view.html', '');

          // create mock prestamo
          mockPrestamo = new PrestamosService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Prestamo about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          PrestamosController = $controller('PrestamosController as vm', {
            $scope: $scope,
            prestamoResolve: mockPrestamo
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:prestamoId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.prestamoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            prestamoId: 1
          })).toEqual('/prestamos/1');
        }));

        it('should attach an prestamo to the controller scope', function () {
          expect($scope.vm.prestamo._id).toBe(mockPrestamo._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/prestamos/client/views/view-prestamo.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/prestamos/client/views/list-prestamos.client.view.html', '');

          $state.go('prestamos.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('prestamos/');
          $rootScope.$digest();

          expect($location.path()).toBe('/prestamos');
          expect($state.current.templateUrl).toBe('/modules/prestamos/client/views/list-prestamos.client.view.html');
        }));
      });
    });
  });
}());
