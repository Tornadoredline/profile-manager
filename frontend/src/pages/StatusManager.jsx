import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { statusAPI } from '../services/api';
import StatusList from '../components/Statuses/StatusList';
import StatusForm from '../components/Statuses/StatusForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const StatusManager = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [categoryType, setCategoryType] = useState('personal');

  const { addNotification } = useNotification();
  const { isAdmin } = useAuth();

  const loadStatuses = async () => {
    try {
      setLoading(true);
      const data = await statusAPI.getStatusesByCategory(categoryType);
      setStatuses(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load statuses');
      console.error('Error loading statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, [categoryType]);

  const handleCreateStatus = async (statusData) => {
    try {
      const newStatus = await statusAPI.createStatus({
        ...statusData,
        category_type: categoryType
      });
      setStatuses(prev => [...prev, newStatus.status]);
      addNotification('Статус успешно создан', 'success');
      setShowForm(false);
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to create status', 'error');
    }
  };

  const handleUpdateStatus = async (id, statusData) => {
    try {
      const updatedStatus = await statusAPI.updateStatus(id, statusData);
      setStatuses(prev => prev.map(status => 
        status.id === id ? { ...status, ...statusData } : status
      ));
      addNotification('Статус успешно обновлен', 'success');
      setEditingStatus(null);
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  const handleDeleteStatus = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот статус?')) {
      return;
    }

    try {
      await statusAPI.deleteStatus(id);
      setStatuses(prev => prev.filter(status => status.id !== id));
      addNotification('Статус успешно удален', 'success');
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to delete status', 'error');
    }
  };

  if (loading && statuses.length === 0) {
    return <LoadingSpinner text="Загрузка статусов..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Управление статусами
            </h2>
            
            {/* Category Selector */}
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="personal">Личные профили</option>
              <option value="for_sale">Профили для продажи</option>
            </select>
          </div>

          {/* Create Button - Only for admin */}
          {isAdmin() && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-plus mr-2"></i>
              Добавить статус
            </button>
          )}
        </div>
      </div>

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

      {/* Status List */}
      <StatusList
        statuses={statuses}
        onEdit={setEditingStatus}
        onDelete={handleDeleteStatus}
        loading={loading}
        isAdmin={isAdmin()}
      />

      {/* Create/Edit Form Modal */}
      {(showForm || editingStatus) && isAdmin() && (
        <StatusForm
          status={editingStatus}
          categoryType={categoryType}
          onSubmit={editingStatus ? 
            (data) => handleUpdateStatus(editingStatus.id, data) : 
            handleCreateStatus
          }
          onCancel={() => {
            setShowForm(false);
            setEditingStatus(null);
          }}
        />
      )}
    </div>
  );
};

export default StatusManager;