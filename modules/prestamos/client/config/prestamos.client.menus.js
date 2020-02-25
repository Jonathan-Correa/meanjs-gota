(function () {
  'use strict';

  // Configuring The Prestamos Module
  angular
    .module('prestamos')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Prestamos',
      state: 'prestamos',
      type: 'dropdown',
      roles: ['admin', 'debtor']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'prestamos', {
      title: 'List Prestamos',
      state: 'prestamos.list',
      roles: ['admin', 'debtor']
    });
  }
}());
