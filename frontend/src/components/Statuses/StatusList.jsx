import React from 'react';
import LoadingSpinner from '../UI/LoadingSpinner';

const StatusList = ({ statuses, onEdit, onDelete, loading, isAdmin }) => {
  if (loading && statuses.length === 0) {
    return <LoadingSpinner text="Загрузка статусов..." />;
  }

  if (statuses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
        <i className="fas fa-tags text-gray-400 text-4xl mb-4"></i>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Статусы не найдены
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isAdmin ? 'Создайте первый статус для этой категории' : 'Нет доступных статусов'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statuses.map((status) => (
        <div
          key={status.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div 
            className="h-2"
            style={{ backgroundColor: status.color }}
          ></div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: `${status.color}20` }}
                >
                  <i className={`fas ${status.icon} text-lg`} style={{ color: status.color }}></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {status.name}
                </h3>
              </div>

              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(status)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                    title="Редактировать статус"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  
                  <button
                    onClick={() => onDelete(status.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    title="Удалить статус"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </div>

            {status.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {status.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Порядок: {status.display_order}</span>
              <div className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: status.color }}
                ></span>
                <span>{status.color}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusList;