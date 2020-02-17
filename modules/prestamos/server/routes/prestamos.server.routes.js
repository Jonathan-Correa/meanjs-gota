'use strict';

/**
 * Module dependencies
 */
var prestamosPolicy = require('../policies/prestamos.server.policy'),
  prestamos = require('../controllers/prestamos.server.controller');

module.exports = function(app) {
  // Prestamos collection routes
  app.route('/api/prestamos').all(prestamosPolicy.isAllowed)
    .get(prestamos.list)
    .post(prestamos.create);

  // Single Prestamo routes
  app.route('/api/prestamos/:prestamoId').all(prestamosPolicy.isAllowed)
    .get(prestamos.read)
    .put(prestamos.update)
    .delete(prestamos.delete);

  // Finish by binding the Prestamo middleware
  app.param('prestamoId', prestamos.prestamoByID);

};
