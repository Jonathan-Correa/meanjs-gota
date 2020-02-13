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
          mainstate = $state.get('admin.prestamos');
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
          liststate = $state.get('admin.prestamos.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/prestamos/client/views/admin/list-prestamos.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          PrestamosAdminController,
          mockPrestamo;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.prestamos.create');
          $templateCache.put('/modules/prestamos/client/views/admin/form-prestamo.client.view.html', '');

          // Create mock prestamo
          mockPrestamo = new PrestamosService();

          // Initialize Controller
          PrestamosAdminController = $controller('PrestamosAdminController as vm', {
            $scope: $scope,
            prestamoResolve: mockPrestamo
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.prestamoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/prestamos/create');
        }));

        it('should attach an prestamo to the controller scope', function () {
          expect($scope.vm.prestamo._id).toBe(mockPrestamo._id);
          expect($scope.vm.prestamo._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('/modules/prestamos/client/views/admin/form-prestamo.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          PrestamosAdminController,
          mockPrestamo;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.prestamos.edit');
          $templateCache.put('/modules/prestamos/client/views/admin/form-prestamo.client.view.html', '');

          // Create mock prestamo
          mockPrestamo = new PrestamosService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Prestamo about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          PrestamosAdminController = $controller('PrestamosAdminController as vm', {
            $scope: $scope,
            prestamoResolve: mockPrestamo
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:prestamoId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.prestamoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            prestamoId: 1
          })).toEqual('/admin/prestamos/1/edit');
        }));

        it('should attach an prestamo to the controller scope', function () {
          expect($scope.vm.prestamo._id).toBe(mockPrestamo._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('/modules/prestamos/client/views/admin/form-prestamo.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
