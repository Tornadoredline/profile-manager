import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import UserList from '../components/Users/UserList';
import UserForm from '../components/Users/UserForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { addNotification } = useNotification();
  const { isAdmin } = useAuth();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getUsers();
      setUsers(data.users || data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
    }
  }, [isAdmin]);

  const handleCreateUser = async (userData) => {
    try {
      const newUser = await usersAPI.createUser(userData);
      setUsers(prev => [...prev, newUser.user]);
      addNotification('Пользователь успешно создан', 'success');
      setShowForm(false);
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      const updatedUser = await usersAPI.updateUser(id, userData);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));
      addNotification('Пользователь успешно обновлен', 'success');
      setEditingUser(null);
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await usersAPI.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      addNotification('Пользователь успешно удален', 'success');
    } catch (error) {
      addNotification(error.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-triangle text-red-400"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Доступ запрещен
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>У вас нет прав для доступа к управлению пользователями.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return <LoadingSpinner text="Загрузка пользователей..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Управление пользователями
          </h2>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i className="fas fa-plus mr-2"></i>
            Добавить пользователя
          </button>
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

      {/* User List */}
      <UserList
        users={users}
        onEdit={setEditingUser}
        onDelete={handleDeleteUser}
        loading={loading}
      />

      {/* Create/Edit Form Modal */}
      {(showForm || editingUser) && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? 
            (data) => handleUpdateUser(editingUser.id, data) : 
            handleCreateUser
          }
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManager;