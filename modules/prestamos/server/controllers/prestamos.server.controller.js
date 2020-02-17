'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Prestamo = mongoose.model('Prestamo'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  User = mongoose.model('User');

/**
 * Create an Prestamo
 */
exports.create = function (req, res) {
  var prestamo = new Prestamo(req.body);
  prestamo.user = req.user;

  prestamo.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(prestamo);
    }
  });
};

/**
 * Show the current Prestamo
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var prestamo = req.prestamo ? req.prestamo.toJSON() : {};

  // Add a custom field to the Prestamo, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Prestamo model.
  prestamo.isCurrentUserOwner = !!(req.user && prestamo.user && prestamo.user._id.toString() === req.user._id.toString());

  res.json(prestamo);
};

/**
 * Update an Prestamo
 */
exports.update = function (req, res) {
  var prestamo = req.prestamo;

  prestamo.amount = req.body.amount;
  prestamo.debtor = req.body.debtor;

  prestamo.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(prestamo);
    }
  });
};

/**
 * Delete an Prestamo
 */
exports.delete = function (req, res) {
  var prestamo = req.prestamo;

  prestamo.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(prestamo);
    }
  });
};

/**
 * List of Prestamos
 */
exports.list = function (req, res) {

  var count = req.query.pageSize || 100;
  var page = req.query.pageNumber || 1;
  var populate = req.query.populate || {
    path: '',
    field: ''
  };
  var filter = req.query.filter || {};

  var processFilter = new Prestamo().processFilter(filter);
  var processPopulate = new Prestamo().processPopulate(populate);

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
    sort: req.query.sort || '-modified',
    start: (page - 1) * count,
    count: count
  };

  Prestamo.find().populate(processPopulate.path, processPopulate.field).field(options).keyword(options).filter(options).order(options).page(options, function (err, prestamos) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(prestamos);
    }
  });
};

/**
 * Prestamo middleware
 */
exports.prestamoByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Prestamo is invalid'
    });
  }

  Prestamo.findById(id).populate('user', 'displayName').exec(function (err, prestamo) {
    if (err) {
      return next(err);
    } else if (!prestamo) {
      return res.status(404).send({
        message: 'No prestamo with that identifier has been found'
      });
    }
    req.prestamo = prestamo;
    next();
  });
};
