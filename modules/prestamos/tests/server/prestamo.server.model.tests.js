'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Prestamo = mongoose.model('Prestamo');

/**
 * Globals
 */
var user,
  prestamo;

/**
 * Unit tests
 */
describe('Prestamo Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3',
      provider: 'local'
    });

    user.save()
      .then(function () {
        prestamo = new Prestamo({
          title: 'Prestamo Title',
          content: 'Prestamo Content',
          user: user
        });

        done();
      })
      .catch(done);
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      prestamo.save(function (err) {
        should.not.exist(err);
        return done();
      });
    });

    it('should be able to show an error when try to save without title', function (done) {
      prestamo.title = '';

      prestamo.save(function (err) {
        should.exist(err);
        return done();
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
