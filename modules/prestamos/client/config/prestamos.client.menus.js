(function () {
  'use strict';

  angular
    .module('prestamos')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Prestamos',
      state: 'prestamos',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'prestamos', {
      title: 'List Prestamos',
      state: 'prestamos.list',
      roles: ['*']
    });
  }
}());
