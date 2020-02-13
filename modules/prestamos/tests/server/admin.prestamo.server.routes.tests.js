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
describe('Prestamo Admin CRUD tests', function () {
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
      roles: ['user', 'admin'],
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

  it('should be able to save an prestamo if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new prestamo
        agent.post('/api/prestamos')
          .send(prestamo)
          .expect(200)
          .end(function (prestamoSaveErr, prestamoSaveRes) {
            // Handle prestamo save error
            if (prestamoSaveErr) {
              return done(prestamoSaveErr);
            }

            // Get a list of prestamos
            agent.get('/api/prestamos')
              .end(function (prestamosGetErr, prestamosGetRes) {
                // Handle prestamo save error
                if (prestamosGetErr) {
                  return done(prestamosGetErr);
                }

                // Get prestamos list
                var prestamos = prestamosGetRes.body;

                // Set assertions
                (prestamos[0].user._id).should.equal(userId);
                (prestamos[0].title).should.match('Prestamo Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an prestamo if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new prestamo
        agent.post('/api/prestamos')
          .send(prestamo)
          .expect(200)
          .end(function (prestamoSaveErr, prestamoSaveRes) {
            // Handle prestamo save error
            if (prestamoSaveErr) {
              return done(prestamoSaveErr);
            }

            // Update prestamo title
            prestamo.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing prestamo
            agent.put('/api/prestamos/' + prestamoSaveRes.body._id)
              .send(prestamo)
              .expect(200)
              .end(function (prestamoUpdateErr, prestamoUpdateRes) {
                // Handle prestamo update error
                if (prestamoUpdateErr) {
                  return done(prestamoUpdateErr);
                }

                // Set assertions
                (prestamoUpdateRes.body._id).should.equal(prestamoSaveRes.body._id);
                (prestamoUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an prestamo if no title is provided', function (done) {
    // Invalidate title field
    prestamo.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new prestamo
        agent.post('/api/prestamos')
          .send(prestamo)
          .expect(422)
          .end(function (prestamoSaveErr, prestamoSaveRes) {
            // Set message assertion
            (prestamoSaveRes.body.message).should.match('Title cannot be blank');

            // Handle prestamo save error
            done(prestamoSaveErr);
          });
      });
  });

  it('should be able to delete an prestamo if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new prestamo
        agent.post('/api/prestamos')
          .send(prestamo)
          .expect(200)
          .end(function (prestamoSaveErr, prestamoSaveRes) {
            // Handle prestamo save error
            if (prestamoSaveErr) {
              return done(prestamoSaveErr);
            }

            // Delete an existing prestamo
            agent.delete('/api/prestamos/' + prestamoSaveRes.body._id)
              .send(prestamo)
              .expect(200)
              .end(function (prestamoDeleteErr, prestamoDeleteRes) {
                // Handle prestamo error error
                if (prestamoDeleteErr) {
                  return done(prestamoDeleteErr);
                }

                // Set assertions
                (prestamoDeleteRes.body._id).should.equal(prestamoSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single prestamo if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new prestamo model instance
    prestamo.user = user;
    var prestamoObj = new Prestamo(prestamo);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new prestamo
        agent.post('/api/prestamos')
          .send(prestamo)
          .expect(200)
          .end(function (prestamoSaveErr, prestamoSaveRes) {
            // Handle prestamo save error
            if (prestamoSaveErr) {
              return done(prestamoSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (prestamoInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
