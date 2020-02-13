(function (app) {
  'use strict';

  app.registerModule('prestamos', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('prestamos.admin', ['core.admin']);
  app.registerModule('prestamos.admin.routes', ['core.admin.routes']);
  app.registerModule('prestamos.services');
  app.registerModule('prestamos.routes', ['ui.router', 'core.routes', 'prestamos.services']);
}(ApplicationConfiguration));
