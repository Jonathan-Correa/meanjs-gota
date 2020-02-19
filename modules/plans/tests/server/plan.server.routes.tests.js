'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Plan = mongoose.model('Plan'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  plan;

/**
 * Plan routes tests
 */
describe('Plan CRUD tests', function () {

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

    // Save a user to the test db and create new plan
    user.save()
      .then(function () {
        plan = {
          title: 'Plan Title',
          content: 'Plan Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an plan if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/plans')
          .send(plan)
          .expect(403)
          .end(function (planSaveErr, planSaveRes) {
            // Call the assertion callback
            done(planSaveErr);
          });

      });
  });

  it('should not be able to save an plan if not logged in', function (done) {
    agent.post('/api/plans')
      .send(plan)
      .expect(403)
      .end(function (planSaveErr, planSaveRes) {
        // Call the assertion callback
        done(planSaveErr);
      });
  });

  it('should not be able to update an plan if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/plans')
          .send(plan)
          .expect(403)
          .end(function (planSaveErr, planSaveRes) {
            // Call the assertion callback
            done(planSaveErr);
          });
      });
  });

  it('should be able to get a list of plans if not signed in', function (done) {
    // Create new plan model instance
    var planObj = new Plan(plan);

    // Save the plan
    planObj.save(function () {
      // Request plans
      agent.get('/api/plans')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single plan if not signed in', function (done) {
    // Create new plan model instance
    var planObj = new Plan(plan);

    // Save the plan
    planObj.save(function () {
      agent.get('/api/plans/' + planObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', plan.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single plan with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/plans/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Plan is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single plan which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent plan
    agent.get('/api/plans/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No plan with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an plan if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/plans')
          .send(plan)
          .expect(403)
          .end(function (planSaveErr, planSaveRes) {
            // Call the assertion callback
            done(planSaveErr);
          });
      });
  });

  it('should not be able to delete an plan if not signed in', function (done) {
    // Set plan user
    plan.user = user;

    // Create new plan model instance
    var planObj = new Plan(plan);

    // Save the plan
    planObj.save(function () {
      // Try deleting plan
      agent.delete('/api/plans/' + planObj._id)
        .expect(403)
        .end(function (planDeleteErr, planDeleteRes) {
          // Set message assertion
          (planDeleteRes.body.message).should.match('User is not authorized');

          // Handle plan error error
          done(planDeleteErr);
        });

    });
  });

  it('should be able to get a single plan that has an orphaned user reference', function (done) {
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

          // Save a new plan
          agent.post('/api/plans')
            .send(plan)
            .expect(200)
            .end(function (planSaveErr, planSaveRes) {
              // Handle plan save error
              if (planSaveErr) {
                return done(planSaveErr);
              }

              // Set assertions on new plan
              (planSaveRes.body.title).should.equal(plan.title);
              should.exist(planSaveRes.body.user);
              should.equal(planSaveRes.body.user._id, orphanId);

              // force the plan to have an orphaned user reference
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

                    // Get the plan
                    agent.get('/api/plans/' + planSaveRes.body._id)
                      .expect(200)
                      .end(function (planInfoErr, planInfoRes) {
                        // Handle plan error
                        if (planInfoErr) {
                          return done(planInfoErr);
                        }

                        // Set assertions
                        (planInfoRes.body._id).should.equal(planSaveRes.body._id);
                        (planInfoRes.body.title).should.equal(plan.title);
                        should.equal(planInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single plan if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new plan model instance
    var planObj = new Plan(plan);

    // Save the plan
    planObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/plans/' + planObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', plan.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single plan, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'planowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Plan
    var _planOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _planOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Plan
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

          // Save a new plan
          agent.post('/api/plans')
            .send(plan)
            .expect(200)
            .end(function (planSaveErr, planSaveRes) {
              // Handle plan save error
              if (planSaveErr) {
                return done(planSaveErr);
              }

              // Set assertions on new plan
              (planSaveRes.body.title).should.equal(plan.title);
              should.exist(planSaveRes.body.user);
              should.equal(planSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the plan
                  agent.get('/api/plans/' + planSaveRes.body._id)
                    .expect(200)
                    .end(function (planInfoErr, planInfoRes) {
                      // Handle plan error
                      if (planInfoErr) {
                        return done(planInfoErr);
                      }

                      // Set assertions
                      (planInfoRes.body._id).should.equal(planSaveRes.body._id);
                      (planInfoRes.body.title).should.equal(plan.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (planInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Plan.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
