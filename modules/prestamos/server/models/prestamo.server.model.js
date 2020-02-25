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
  debtor: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: 'please fill in amount'
  },
  plan_id: {
    type: Schema.ObjectId,
    ref: 'Plan'
  },
  total_to_pay: {
    type: Number
  },
  init_date: {
    type: Date,
    default: Date().now,
    required: 'Please fill in init date'
  },
  final_date: {
    type: Date
    //required: 'Please fill in final date'
  },
  value_per_fee: {
    type: Number,
    required: true
  },
  createdBy: {
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
  }
});

// methods
PrestamoSchema.methods.processValue = function (prestamo, plan){

  var agregated_value = (prestamo.amount * plan.interest) / 100;

  prestamo.total_to_pay = prestamo.amount + agregated_value;



  prestamo.value_per_fee = prestamo.total_to_pay / plan.number_of_fees;
}



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

  if (Object.keys(params).length === 0) {
    return {};
  }

  var moment = require('moment');
  var date1;
  var date2;

  for (var field in PrestamoSchema.paths) {

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
    }

    
    
    if (field === 'createdBy' && params['createdBy._id']) {
      params.createdBy = mongoose.Types.ObjectId(params['createdBy._id']);
      delete params['createdBy._id'];
    }

    if (field === 'created' && params.created) {
      date1 = moment(params[field].begin, 'YYYY-MM-DD H:mm:ss');
      date2 = moment(params[field].end, 'YYYY-MM-DD H:mm:ss');
      params[field] = {
        $gte: date1.toDate(),
        $lte: date2.toDate()
      };
    }

    if (field === 'modifiedby' && params['modifiedby._id']) {
      params.modifiedby = mongoose.Types.ObjectId(params['modifiedby._id']);
      delete params['modifiedby._id'];
    }

    if (field === 'modified' && params.modified) {
      date1 = moment(params[field].begin, 'YYYY-MM-DD H:mm:ss');
      date2 = moment(params[field].end, 'YYYY-MM-DD H:mm:ss');
      params[field] = {
        $gte: date1.toDate(),
        $lte: date2.toDate()
      };
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
    return {
      path: '',
      select: ''
    };
  }

  var typeParams = 'array';

  if (typeof params === 'string') {
    params = JSON.parse(params);
    typeParams = 'object';
  }

  if (typeof params != 'object') {
    return {
      path: '',
      select: ''
    };
  }

  if (typeParams === 'array') {

    var lengthParams = params.length;
    var objectPopulate = {
      path: '',
      select: ''
    };

    for (var index = 0; index < params.length; index++) {
      if (typeof params[index] == 'string') {
        params[index] = JSON.parse(params[index]);
      }
      objectPopulate.path += params[index].path; 
      objectPopulate.select += params[index].select;
      if (index < lengthParams - 1) {
        objectPopulate.path += ' '; 
        objectPopulate.select += ' ';
      }
    }

    return objectPopulate;
  }

  if (Object.keys(params).length === 0) {
    return {
      path: '',
      select: ''
    };
  }

  return params;
};

PrestamoSchema.methods.processSort = function (params) {
  
  if (!params || typeof params == 'undefined') {
    return {
      modified: -1
    };
  }

  if (typeof params == 'string') {
    params = JSON.parse(params);
  }

  if (typeof params != 'object') {
    return {
      modified: -1
    };
  }

  if (Object.keys(params).length === 0) {
    return {
      modified: -1
    };
  }

  for (const property in params) {
    if (params[property] == 'desc') {
      params[property] = -1
    } else {
      params[property] = 1
    }
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
            roles: {
              $in: ['admin']
            }
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
