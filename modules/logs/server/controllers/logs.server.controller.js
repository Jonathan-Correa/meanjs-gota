'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Log = mongoose.model('Log'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * List of Logs
 */
exports.list = function (req, res) {

  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Log().processFilter(filter);
  var processPopulate = new Log().processPopulate(populate);
  var processSort = new Log().processSort(sort);

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

  Log.find().populate(processPopulate.path, processPopulate.select).field(options).keyword(options).filter(options).order(options).page(options, function (err, logs) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(logs);
    }
  });
};
