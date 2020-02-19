(function (app) {
  'use strict';

  app.registerModule('prestamos', ['core']);
  app.registerModule('prestamos.admin', ['core.admin']);
  app.registerModule('prestamos.admin.routes', ['core.admin.routes']);
  app.registerModule('prestamos.services');
  app.registerModule('prestamos.routes', ['ui.router', 'core.routes', 'prestamos.services']);
}(ApplicationConfiguration));
