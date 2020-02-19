'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Prestamo = mongoose.model('Prestamo'),
  User = mongoose.model('User'),
  Log = mongoose.model('Log'),
  Plan = mongoose.model('Plan'),
  moment = require('moment'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an Prestamo
 */
exports.create = async function (req, res) {

  var prestamo = new Prestamo(req.body);
  prestamo.debtor = req.body.debtor._id;
  prestamo.createdBy = req.user._id;

  var plan = await Plan.findOne({_id: prestamo.plan_id});

  if(!Plan) return res.json({message: 'The plan does not exists'});

  prestamo.processValue(prestamo, plan);

  prestamo.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      // isAssigned field updated to 1
      User.update({
        _id: mongoose.Types.ObjectId(prestamo.debtor)
      }, {
        $set: {
          isAssigned: 1
        }
      }, async function(err){
        
        if(err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }

        var debtor = await User.findOne({_id: prestamo.debtor});

        var log = new Log({
          path: '/api/prestamos',
          method: 'POST',
          user: req.user._id,
          action: 'Creó un prestamo para el usuario ' + debtor.displayName
        });

        await log.save();

        return res.json(prestamo);
      });
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
  prestamo.isCurrentUserOwner = !!(req.user && prestamo.createdBy && prestamo.createdBy._id.toString() === req.user._id.toString());

  res.json(prestamo);
};

/**
 * Update an Prestamo
 */
exports.update = async function (req, res) {
  var prestamo = req.prestamo;

  var old_prestamo = mongoose.Types.ObjectId(req.prestamo.debtor);
  var new_prestamo = mongoose.Types.ObjectId(req.body.debtor._id);

  prestamo.debtor = req.body.debtor._id;
  prestamo.amount = req.body.amount;
  prestamo.interest = req.body.interest;
  prestamo.date = req.body.date;
  prestamo.address = req.body.address;

  if(!old_prestamo.equals(new_prestamo)){

    await User.update({
        _id: old_prestamo
      }, 
      {
        $set: {
          isAssigned: 0
        }
      }
    );
    await User.update({
      _id: new_prestamo
    }, {
      $set: {
        isAssigned: 1
      }
    });
  }

  prestamo.save(async function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(prestamo);
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

      User.findByIdAndUpdate(mongoose.Types.ObjectId(prestamo.debtor), {isAssigned: 0}, function(err){
        
        if(err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        return res.json(prestamo);
      });
    }
  });
};

/**
 * List of Prestamos
 */
exports.list = function (req, res) {
  
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };

  var populate = req.query.populate || [];

  var filter = req.query.filter || {};

  var processFilter = new Prestamo().processFilter(filter);
  var processPopulate = new Prestamo().processPopulate(populate);
  var processSort = new Prestamo().processSort(sort);

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

  Prestamo.find().populate(processPopulate.path, processPopulate.select).field(options).keyword(options).filter(options).order(options).page(options, function (err, prestamos) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      console.log(prestamos);
      res.json(prestamos);
    }
  });
};

/**
 * Prestamo middleware
 */
exports.prestamoByID = function (req, res, next, id) {

  var populate = req.query.populate || {
    path: '',
    field: ''
  };

  var filter = req.query.filter || {};

  var processFilter = new Prestamo().processFilter(filter);
  var processPopulate = new Prestamo().processPopulate(populate);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Prestamo is invalid'
    });
  }

  Prestamo.findById(id).populate(processPopulate.path, processPopulate.field).exec(function (err, prestamo) {
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
