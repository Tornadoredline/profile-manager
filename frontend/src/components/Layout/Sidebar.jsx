import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Личные профили',
      href: '/',
      icon: 'fas fa-user',
      category: 'personal'
    },
    {
      name: 'Профили для продажи',
      href: '/for-sale',
      icon: 'fas fa-shopping-cart',
      category: 'for_sale'
    },
    {
      name: 'Управление email',
      href: '/emails',
      icon: 'fas fa-envelope',
      adminOnly: false
    },
    {
      name: 'Настройки полей',
      href: '/fields',
      icon: 'fas fa-cog',
      adminOnly: true
    },
    {
      name: 'Настройки статусов',
      href: '/statuses',
      icon: 'fas fa-flag',
      adminOnly: true
    },
    {
      name: 'Пользователи',
      href: '/users',
      icon: 'fas fa-users',
      adminOnly: true
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin())
  );

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
      <nav className="mt-8 px-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <i className={`${item.icon} mr-3 w-5 text-center`}></i>
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Statistics Section */}
      <div className="mt-8 px-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Статистика системы
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Пользователей</span>
              <span className="font-medium text-gray-900 dark:text-white">-</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Профилей</span>
              <span className="font-medium text-gray-900 dark:text-white">-</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Email-ов</span>
              <span className="font-medium text-gray-900 dark:text-white">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;