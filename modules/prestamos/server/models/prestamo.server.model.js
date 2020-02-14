'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

/**
 * Prestamo Schema
 */
var PrestamoSchema = new Schema({
  amount: {
    type: String,
    default: '',
    required: 'Please fill in amount',
    trim: false
  },
  interest: {
    type: String,
    default: '0%'
  },
  debtor: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  modified: {
    type: Date,
    default: Date.now
  },
  current_date: {
    type: Date,
    default: Date.now
  },
  expire_date: {
    type: Date
  }
});

// Methods
PrestamoSchema.methods.processFilter = function (params) {

  if (!params || typeof params == 'undefined') {
    return {};
  }

  if (typeof params == 'string') {
    params = JSON.parse(params);
  }

  if (typeof params != 'object') {
    return {};
  }

  if ( Object.keys(params).length == 0) {
    return {};
  }

  var moment = require('moment');

  // eslint-disable-next-line guard-for-in
  for (var field in PrestamoSchema.paths) {

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
    }

    if (field === 'user' && params['user._id']) {
      params['user'] = mongoose.Types.ObjectId(params['user._id']);
      delete params['user._id'];
    }
    
    if (field === 'created' && params['created']) {
      var date1 = moment(params[field]['begin'],'YYYY-MM-DD H:mm:ss');
      var date2 = moment(params[field]['end'],'YYYY-MM-DD H:mm:ss');
      params[field]={$gte:date1.toDate(),$lte:date2.toDate()}
    }

    if (field == 'modifiedby' && params['modifiedby._id']) {
      params['modifiedby'] = mongoose.Types.ObjectId(params['modifiedby._id']);
      delete params['modifiedby._id'];
    }

    if (field == 'modified' && params['modified']) {
      var date1 = moment(params[field]['begin'],'YYYY-MM-DD H:mm:ss');
      var date2 = moment(params[field]['end'],'YYYY-MM-DD H:mm:ss');
      params[field]={$gte:date1.toDate(),$lte:date2.toDate()}
    }

    if (!params[field]) {
      continue;
    }

    if (PrestamoSchema.paths[field].instance === 'Number') {
      params[field] = parseFloat(params[field], 10);
    }
  }
  return params;
};

PrestamoSchema.methods.processPopulate = function (params) {

  if (!params || typeof params == 'undefined') {
    return { path: '', field: '' };
  }

  if (typeof params == 'string') {
    params = JSON.parse(params);
  }

  if (typeof params != 'object') {
    return { path: '', field: '' };
  }

  if ( Object.keys(params).length == 0) {
    return { path: '', field: '' };
  }

  return params;
};

PrestamoSchema.statics.seed = seed;

mongoose.model('Prestamo', PrestamoSchema);

/**
* Seeds the User collection with document (Prestamo)
* and provided options.
*/
function seed(doc, options) {
  var Prestamo = mongoose.model('Prestamo');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(findAdminUser)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findAdminUser(skip) {
      var User = mongoose.model('User');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        User
          .findOne({
            roles: { $in: ['admin'] }
          })
          .exec(function (err, admin) {
            if (err) {
              return reject(err);
            }

            doc.user = admin;

            return resolve();
          });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Prestamo
          .findOne({
            title: doc.title
          })
          .exec(function (err, existing) {
            if (err) {
              return reject(err);
            }

            if (!existing) {
              return resolve(false);
            }

            if (existing && !options.overwrite) {
              return resolve(true);
            }

            // Remove Prestamo (overwrite)

            existing.remove(function (err) {
              if (err) {
                return reject(err);
              }

              return resolve(false);
            });
          });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve({
            message: chalk.yellow('Database Seeding: Prestamo\t' + doc.title + ' skipped')
          });
        }

        var prestamo = new Prestamo(doc);

        prestamo.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Prestamo\t' + prestamo.title + ' added'
          });
        });
      });
    }
  });
}
