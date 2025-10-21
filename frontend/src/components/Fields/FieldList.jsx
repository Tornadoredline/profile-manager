import React, { useState } from 'react';
import LoadingSpinner from '../UI/LoadingSpinner';

const FieldList = ({ fields, onEdit, onDelete, onReorder, loading, isAdmin }) => {
  const [draggedField, setDraggedField] = useState(null);

  const handleDragStart = (e, field) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetField) => {
    e.preventDefault();
    if (!draggedField || draggedField.id === targetField.id) return;

    const draggedIndex = fields.findIndex(f => f.id === draggedField.id);
    const targetIndex = fields.findIndex(f => f.id === targetField.id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      onReorder(draggedField.id, targetField.display_order);
    }
    
    setDraggedField(null);
  };

  const getFieldTypeIcon = (type) => {
    const icons = {
      text: 'fa-font',
      number: 'fa-hashtag',
      select: 'fa-list',
      date: 'fa-calendar',
      textarea: 'fa-align-left'
    };
    return icons[type] || 'fa-cube';
  };

  if (loading && fields.length === 0) {
    return <LoadingSpinner text="Загрузка полей..." />;
  }

  if (fields.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
        <i className="fas fa-cubes text-gray-400 text-4xl mb-4"></i>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Поля не найдены
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isAdmin ? 'Создайте первое поле для этой категории' : 'Нет доступных полей'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {fields.map((field, index) => (
          <li 
            key={field.id}
            draggable={isAdmin}
            onDragStart={(e) => handleDragStart(e, field)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, field)}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center">
                {/* Drag handle */}
                {isAdmin && (
                  <div className="flex-shrink-0 mr-3 cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <i className="fas fa-grip-vertical"></i>
                  </div>
                )}

                {/* Field icon and info */}
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <i className={`fas ${getFieldTypeIcon(field.type)} text-blue-600 dark:text-blue-400`}></i>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {field.name}
                    </h3>
                    {field.is_required && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                        Обязательное
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{field.type}</span>
                    <span className="mx-2">•</span>
                    <span>Порядок: {field.display_order}</span>
                    {field.description && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{field.description}</span>
                      </>
                    )}
                  </div>

                  {/* Options for select fields */}
                  {field.type === 'select' && field.options && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {field.options.map((option, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(field)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                    title="Редактировать поле"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  
                  <button
                    onClick={() => onDelete(field.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    title="Удалить поле"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FieldList;