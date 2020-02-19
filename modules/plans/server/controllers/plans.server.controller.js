'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Plan = mongoose.model('Plan'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an Plan
 */
exports.create = function (req, res) {
  var plan = new Plan(req.body);
  plan.user = req.user;

  plan.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(plan);
    }
  });
};

/**
 * Show the current Plan
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var plan = req.plan ? req.plan.toJSON() : {};

  // Add a custom field to the Plan, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Plan model.
  plan.isCurrentUserOwner = !!(req.user && plan.user && plan.user._id.toString() === req.user._id.toString());

  res.json(plan);
};

/**
 * Update an Plan
 */
exports.update = function (req, res) {
  var plan = req.plan;

  plan.name = req.body.name;
  plan.periodicity = req.body.periodicity;
  plan.interest = req.body.interest;
  plan.modifiedBy = req.user._id;
  plan.modified = Date();

  plan.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(plan);
    }
  });
};

/**
 * Delete an Plan
 */
exports.delete = function (req, res) {
  var plan = req.plan;

  plan.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(plan);
    }
  });
};

/**
 * List of Plans
 */
exports.list = function (req, res) {

  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Plan().processFilter(filter);
  var processPopulate = new Plan().processPopulate(populate);
  var processSort = new Plan().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.user = req.user._id;
  }

  var options = {
    filters: {
      field: req.query.field || '',
      mandatory: {
        contains: processFilter
      }
    },
    sort: processSort,
    start: (page - 1) * count,
    count: count
  };

  Plan.find().populate(processPopulate.path, processPopulate.select).field(options).keyword(options).filter(options).order(options).page(options, function (err, plans) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(plans);
    }
  });
};

/**
 * Plan middleware
 */
exports.planByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Plan is invalid'
    });
  }

  Plan.findById(id).populate('modifiedBy', 'displayName').populate('user', 'displayName').exec(function (err, plan) {
    if (err) {
      return next(err);
    } else if (!plan) {
      return res.status(404).send({
        message: 'No plan with that identifier has been found'
      });
    }
    req.plan = plan;
    next();
  });
};
