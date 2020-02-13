'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Prestamo = mongoose.model('Prestamo'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  prestamo;

/**
 * Prestamo routes tests
 */
describe('Prestamo CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose.connection.db);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new prestamo
    user.save()
      .then(function () {
        prestamo = {
          title: 'Prestamo Title',
          content: 'Prestamo Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an prestamo if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/prestamos')
          .send(prestamo)
          .expect(403)
          .end(function (prestamoSaveErr, prestamoSaveRes) {
            // Call the assertion callback
            done(prestamoSaveErr);
          });

      });
  });

  it('should not be able to save an prestamo if not logged in', function (done) {
    agent.post('/api/prestamos')
      .send(prestamo)
      .expect(403)
      .end(function (prestamoSaveErr, prestamoSaveRes) {
        // Call the assertion callback
        done(prestamoSaveErr);
      });
  });

  it('should not be able to update an prestamo if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/prestamos')
          .send(prestamo)
          .expect(403)
          .end(function (prestamoSaveErr, prestamoSaveRes) {
            // Call the assertion callback
            done(prestamoSaveErr);
          });
      });
  });

  it('should be able to get a list of prestamos if not signed in', function (done) {
    // Create new prestamo model instance
    var prestamoObj = new Prestamo(prestamo);

    // Save the prestamo
    prestamoObj.save(function () {
      // Request prestamos
      agent.get('/api/prestamos')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single prestamo if not signed in', function (done) {
    // Create new prestamo model instance
    var prestamoObj = new Prestamo(prestamo);

    // Save the prestamo
    prestamoObj.save(function () {
      agent.get('/api/prestamos/' + prestamoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', prestamo.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single prestamo with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/prestamos/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Prestamo is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single prestamo which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent prestamo
    agent.get('/api/prestamos/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No prestamo with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an prestamo if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/prestamos')
          .send(prestamo)
          .expect(403)
          .end(function (prestamoSaveErr, prestamoSaveRes) {
            // Call the assertion callback
            done(prestamoSaveErr);
          });
      });
  });

  it('should not be able to delete an prestamo if not signed in', function (done) {
    // Set prestamo user
    prestamo.user = user;

    // Create new prestamo model instance
    var prestamoObj = new Prestamo(prestamo);

    // Save the prestamo
    prestamoObj.save(function () {
      // Try deleting prestamo
      agent.delete('/api/prestamos/' + prestamoObj._id)
        .expect(403)
        .end(function (prestamoDeleteErr, prestamoDeleteRes) {
          // Set message assertion
          (prestamoDeleteRes.body.message).should.match('User is not authorized');

          // Handle prestamo error error
          done(prestamoDeleteErr);
        });

    });
  });

  it('should be able to get a single prestamo that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new prestamo
          agent.post('/api/prestamos')
            .send(prestamo)
            .expect(200)
            .end(function (prestamoSaveErr, prestamoSaveRes) {
              // Handle prestamo save error
              if (prestamoSaveErr) {
                return done(prestamoSaveErr);
              }

              // Set assertions on new prestamo
              (prestamoSaveRes.body.title).should.equal(prestamo.title);
              should.exist(prestamoSaveRes.body.user);
              should.equal(prestamoSaveRes.body.user._id, orphanId);

              // force the prestamo to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the prestamo
                    agent.get('/api/prestamos/' + prestamoSaveRes.body._id)
                      .expect(200)
                      .end(function (prestamoInfoErr, prestamoInfoRes) {
                        // Handle prestamo error
                        if (prestamoInfoErr) {
                          return done(prestamoInfoErr);
                        }

                        // Set assertions
                        (prestamoInfoRes.body._id).should.equal(prestamoSaveRes.body._id);
                        (prestamoInfoRes.body.title).should.equal(prestamo.title);
                        should.equal(prestamoInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single prestamo if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new prestamo model instance
    var prestamoObj = new Prestamo(prestamo);

    // Save the prestamo
    prestamoObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/prestamos/' + prestamoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', prestamo.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single prestamo, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'prestamoowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Prestamo
    var _prestamoOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _prestamoOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Prestamo
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new prestamo
          agent.post('/api/prestamos')
            .send(prestamo)
            .expect(200)
            .end(function (prestamoSaveErr, prestamoSaveRes) {
              // Handle prestamo save error
              if (prestamoSaveErr) {
                return done(prestamoSaveErr);
              }

              // Set assertions on new prestamo
              (prestamoSaveRes.body.title).should.equal(prestamo.title);
              should.exist(prestamoSaveRes.body.user);
              should.equal(prestamoSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the prestamo
                  agent.get('/api/prestamos/' + prestamoSaveRes.body._id)
                    .expect(200)
                    .end(function (prestamoInfoErr, prestamoInfoRes) {
                      // Handle prestamo error
                      if (prestamoInfoErr) {
                        return done(prestamoInfoErr);
                      }

                      // Set assertions
                      (prestamoInfoRes.body._id).should.equal(prestamoSaveRes.body._id);
                      (prestamoInfoRes.body.title).should.equal(prestamo.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (prestamoInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Prestamo.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
