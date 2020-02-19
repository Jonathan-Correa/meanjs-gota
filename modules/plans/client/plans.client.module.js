(function (app) {
  'use strict';

  app.registerModule('plans', ['core']);
  app.registerModule('plans.admin', ['core.admin']);
  app.registerModule('plans.admin.routes', ['core.admin.routes']);
  app.registerModule('plans.services');
  app.registerModule('plans.routes', ['ui.router', 'core.routes', 'plans.services']);
}(ApplicationConfiguration));
