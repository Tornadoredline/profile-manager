import React from 'react';
import LoadingSpinner from '../UI/LoadingSpinner';

const UserList = ({ users, onEdit, onDelete, loading }) => {
  if (loading && users.length === 0) {
    return <LoadingSpinner text="Загрузка пользователей..." />;
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
        <i className="fas fa-users text-gray-400 text-4xl mb-4"></i>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Пользователи не найдены
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Создайте первого пользователя системы
        </p>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        label: 'Администратор'
      },
      user: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: 'Пользователь'
      }
    };

    const config = roleConfig[role] || roleConfig.user;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <li key={user.id}>
            <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-gray-600 dark:text-gray-300"></i>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </h3>
                    <div className="ml-2">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <p>Зарегистрирован: {formatDate(user.created_at)}</p>
                    {user.updated_at && user.updated_at !== user.created_at && (
                      <p>Обновлен: {formatDate(user.updated_at)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(user)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  title="Редактировать пользователя"
                >
                  <i className="fas fa-edit"></i>
                </button>
                
                {/* Prevent self-deletion */}
                {user.role !== 'admin' && (
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    title="Удалить пользователя"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;