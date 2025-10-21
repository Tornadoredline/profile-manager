import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';

const StatusForm = ({ status, categoryType, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: 'fa-circle',
    display_order: 0,
    description: ''
  });

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const predefinedIcons = [
    'fa-circle', 'fa-check-circle', 'fa-times-circle', 'fa-exclamation-circle',
    'fa-info-circle', 'fa-clock', 'fa-ban', 'fa-pause-circle', 'fa-play-circle',
    'fa-dollar-sign', 'fa-star', 'fa-heart', 'fa-flag', 'fa-tag', 'fa-bell'
  ];

  useEffect(() => {
    if (status) {
      setFormData({
        name: status.name || '',
        color: status.color || '#3B82F6',
        icon: status.icon || 'fa-circle',
        display_order: status.display_order || 0,
        description: status.description || ''
      });
    }
  }, [status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Название статуса обязательно');
      return;
    }

    if (!formData.color) {
      alert('Цвет статуса обязателен');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      title={status ? 'Редактирование статуса' : 'Создание статуса'}
      onClose={onCancel}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Название статуса *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Введите название статуса"
            required
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Цвет статуса *
          </label>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded border border-gray-300 mr-2"
                style={{ backgroundColor: formData.color }}
              ></div>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* Color Palette */}
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                className="w-8 h-8 rounded border-2 border-transparent hover:border-gray-400 focus:outline-none focus:border-blue-500"
                style={{ backgroundColor: color }}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
              />
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Иконка статуса *
          </label>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center mr-2">
                <i className={`fas ${formData.icon}`} style={{ color: formData.color }}></i>
              </div>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="fa-circle"
              />
            </div>
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {predefinedIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`w-8 h-8 rounded border flex items-center justify-center ${
                  formData.icon === icon 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, icon }))}
              >
                <i className={`fas ${icon} text-sm`} style={{ color: formData.color }}></i>
              </button>
            ))}
          </div>
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Порядок отображения
          </label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            min="0"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Описание (необязательно)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Описание статуса"
          />
        </div>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Предпросмотр
          </label>
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <i className={`fas ${formData.icon}`} style={{ color: formData.color }}></i>
            </div>
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {formData.name || 'Название статуса'}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {status ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusForm;