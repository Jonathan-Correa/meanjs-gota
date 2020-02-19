(function () {
  'use strict';

  // Configuring The Plans Module
  angular
    .module('plans')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Plans',
      state: 'plans',
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'plans', {
      title: 'List Plans',
      state: 'plans.list',
      roles: ['admin']
    });
  }
}());
