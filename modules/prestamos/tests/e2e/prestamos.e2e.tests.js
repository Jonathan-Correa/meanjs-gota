'use strict';

describe('Prestamos E2E Tests:', function () {
  describe('Test prestamos page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/prestamos');
      expect(element.all(by.repeater('prestamo in prestamos')).count()).toEqual(0);
    });
  });
});
