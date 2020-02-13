(function () {
  'use strict';

  // Configuring The Prestamos Admin Module
  angular
    .module('prestamos.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Prestamos',
      state: 'admin.prestamos.list'
    });
  }
}());
