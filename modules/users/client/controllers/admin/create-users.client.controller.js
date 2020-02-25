(function () {
  'use strict';
  angular
    .module('users.admin')
    .controller('CreateUserController', CreateUserController);

  CreateUserController.$inject = ['$scope', '$state', 'userResolve', 'UsersService'];

  function CreateUserController($scope, $state, user, UsersService) {
    var vm = this;
    vm.user = user;
    vm.create = create;
    vm.state = $state;

    function create(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }



      UsersService.createUser(vm.user, function () {
        $state.go('admin.users');
        Notification.success({ message: '<i class="fa fa-check"></i> User saved successfully!' });
      }, function (errorResponse) {
        Notification.error({ message: errorResponse.data.message, title: '<i class="glyphicon glyphicon-remove"></i> User update error!' });
      });
    }
  }

}(1));
