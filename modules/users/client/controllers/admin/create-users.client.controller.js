(function () {
  'use strict';
  angular
    .module('users.admin')
    .controller('CreateUserController', CreateUserController);

  CreateUserController.$inject = ['$scope', '$state', 'UsersService'];

  function CreateUserController($scope, $state, UsersService) {
    var vm = this;
    vm.create = create;

    function create(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }
      var user = vm.user;

      UsersService.createUser(user, function () {
        $state.go('admin.users');
        Notification.success({ message: '<i class="fa fa-check"></i> User saved successfully!' });
      }, function (errorResponse) {
        Notification.error({ message: errorResponse.data.message, title: '<i class="glyphicon glyphicon-remove"></i> User update error!' });
      });
    }
  }

}(1));
