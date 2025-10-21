import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { fieldAPI } from '../services/api';
import FieldList from '../components/Fields/FieldList';
import FieldForm from '../components/Fields/FieldForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const FieldManager = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [categoryType, setCategoryType] = useState('for_sale');

  const { addNotification } = useNotification();
  const { isAdmin } = useAuth();

  const loadFields = async () => {
    try {
      setLoading(true);
      const data = await fieldAPI.getFieldsByCategory(categoryType);
      setFields(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load fields');
      console.error('Error loading fields:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, [categoryType]);

  const handleCreateField = async (fieldData) => {
    try {
      const newField = await fieldAPI.createField({
        ...fieldData,
        category_type: categoryType
      });
      setFields(prev => [...prev, newField.field]);
      addNotification('Поле успешно создано', 'success');
      setShowForm(false);
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to create field', 'error');
    }
  };

  const handleUpdateField = async (id, fieldData) => {
    try {
      const updatedField = await fieldAPI.updateField(id, fieldData);
      setFields(prev => prev.map(field => 
        field.id === id ? { ...field, ...fieldData } : field
      ));
      addNotification('Поле успешно обновлено', 'success');
      setEditingField(null);
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to update field', 'error');
    }
  };

  const handleDeleteField = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить это поле?')) {
      return;
    }

    try {
      await fieldAPI.deleteField(id);
      setFields(prev => prev.filter(field => field.id !== id));
      addNotification('Поле успешно удалено', 'success');
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to delete field', 'error');
    }
  };

  const handleReorder = async (fieldId, newOrder) => {
    try {
      await fieldAPI.updateFieldOrder(fieldId, newOrder);
      // Update local state to reflect the new order
      setFields(prev => {
        const updatedFields = [...prev];
        const fieldIndex = updatedFields.findIndex(f => f.id === fieldId);
        if (fieldIndex > -1) {
          updatedFields[fieldIndex].display_order = newOrder;
        }
        // Sort by display_order
        updatedFields.sort((a, b) => a.display_order - b.display_order);
        return updatedFields;
      });
      addNotification('Порядок полей обновлен', 'success');
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to reorder fields', 'error');
    }
  };

  if (loading && fields.length === 0) {
    return <LoadingSpinner text="Загрузка полей..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Управление полями
            </h2>
            
            {/* Category Selector */}
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="for_sale">Профили для продажи</option>
              <option value="personal" disabled>Личные профили (только базовые поля)</option>
            </select>
          </div>

          {/* Create Button - Only for admin */}
          {isAdmin() && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-plus mr-2"></i>
              Добавить поле
            </button>
          )}
        </div>
      </div>

      {/* Info Message for Personal Category */}
      {categoryType === 'personal' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Ограниченная настройка
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>Для личных профилей доступны только базовые поля. Кастомные поля можно добавлять только для категории "Профили для продажи".</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Ошибка загрузки
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field List */}
      <FieldList
        fields={fields}
        onEdit={setEditingField}
        onDelete={handleDeleteField}
        onReorder={handleReorder}
        loading={loading}
        isAdmin={isAdmin()}
      />

      {/* Create/Edit Form Modal */}
      {(showForm || editingField) && isAdmin() && (
        <FieldForm
          field={editingField}
          categoryType={categoryType}
          onSubmit={editingField ? 
            (data) => handleUpdateField(editingField.id, data) : 
            handleCreateField
          }
          onCancel={() => {
            setShowForm(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};

export default FieldManager;