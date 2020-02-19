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
describe('Plan Admin CRUD tests', function () {
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

  it('should be able to save an plan if logged in', function (done) {
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

        // Save a new plan
        agent.post('/api/plans')
          .send(plan)
          .expect(200)
          .end(function (planSaveErr, planSaveRes) {
            // Handle plan save error
            if (planSaveErr) {
              return done(planSaveErr);
            }

            // Get a list of plans
            agent.get('/api/plans')
              .end(function (plansGetErr, plansGetRes) {
                // Handle plan save error
                if (plansGetErr) {
                  return done(plansGetErr);
                }

                // Get plans list
                var plans = plansGetRes.body;

                // Set assertions
                (plans[0].user._id).should.equal(userId);
                (plans[0].title).should.match('Plan Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an plan if signed in', function (done) {
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

        // Save a new plan
        agent.post('/api/plans')
          .send(plan)
          .expect(200)
          .end(function (planSaveErr, planSaveRes) {
            // Handle plan save error
            if (planSaveErr) {
              return done(planSaveErr);
            }

            // Update plan title
            plan.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing plan
            agent.put('/api/plans/' + planSaveRes.body._id)
              .send(plan)
              .expect(200)
              .end(function (planUpdateErr, planUpdateRes) {
                // Handle plan update error
                if (planUpdateErr) {
                  return done(planUpdateErr);
                }

                // Set assertions
                (planUpdateRes.body._id).should.equal(planSaveRes.body._id);
                (planUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an plan if no title is provided', function (done) {
    // Invalidate title field
    plan.title = '';

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

        // Save a new plan
        agent.post('/api/plans')
          .send(plan)
          .expect(422)
          .end(function (planSaveErr, planSaveRes) {
            // Set message assertion
            (planSaveRes.body.message).should.match('Title cannot be blank');

            // Handle plan save error
            done(planSaveErr);
          });
      });
  });

  it('should be able to delete an plan if signed in', function (done) {
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

        // Save a new plan
        agent.post('/api/plans')
          .send(plan)
          .expect(200)
          .end(function (planSaveErr, planSaveRes) {
            // Handle plan save error
            if (planSaveErr) {
              return done(planSaveErr);
            }

            // Delete an existing plan
            agent.delete('/api/plans/' + planSaveRes.body._id)
              .send(plan)
              .expect(200)
              .end(function (planDeleteErr, planDeleteRes) {
                // Handle plan error error
                if (planDeleteErr) {
                  return done(planDeleteErr);
                }

                // Set assertions
                (planDeleteRes.body._id).should.equal(planSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single plan if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new plan model instance
    plan.user = user;
    var planObj = new Plan(plan);

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

        // Save a new plan
        agent.post('/api/plans')
          .send(plan)
          .expect(200)
          .end(function (planSaveErr, planSaveRes) {
            // Handle plan save error
            if (planSaveErr) {
              return done(planSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (planInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
