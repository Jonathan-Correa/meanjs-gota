'use strict';

/**
 * Module dependencies
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, admin.list);

  // Get all users with the role debtor
  app.route('/api/users/getDebtors')
    .get(adminPolicy.isAllowed, admin.getDebtors);

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  // Create user
  app.route('/api/users/create')
    .post(admin.create);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
