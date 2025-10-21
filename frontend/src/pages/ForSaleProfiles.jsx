import React, { useState, useEffect } from 'react';
import { useProfiles } from '../hooks/useProfiles';
import { useNotification } from '../contexts/NotificationContext';
import { fieldAPI } from '../services/api';
import ProfileForm from '../components/Profiles/ProfileForm';
import ProfileList from '../components/Profiles/ProfileList';
import ProfileStats from '../components/Profiles/ProfileStats';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ForSaleProfiles = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [customFields, setCustomFields] = useState([]);

  const { 
    profiles, 
    loading, 
    error, 
    stats, 
    createProfile, 
    updateProfile, 
    deleteProfile,
    bulkDeleteProfiles 
  } = useProfiles('for_sale');

  const { addNotification } = useNotification();

  // Load custom fields for for_sale category
  useEffect(() => {
    const loadCustomFields = async () => {
      try {
        const fields = await fieldAPI.getFieldsByCategory('for_sale');
        setCustomFields(fields);
      } catch (error) {
        console.error('Error loading custom fields:', error);
      }
    };

    loadCustomFields();
  }, []);

  const handleCreateProfile = async (profileData) => {
    const result = await createProfile({
      ...profileData,
      category: 'for_sale'
    });

    if (result.success) {
      addNotification('Профиль для продажи успешно создан', 'success');
      setShowForm(false);
    } else {
      addNotification(result.error, 'error');
    }
  };

  const handleUpdateProfile = async (id, profileData) => {
    const result = await updateProfile(id, profileData);
    
    if (result.success) {
      addNotification('Профиль успешно обновлен', 'success');
      setEditingProfile(null);
    } else {
      addNotification(result.error, 'error');
    }
  };

  const handleDeleteProfile = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот профиль?')) {
      return;
    }

    const result = await deleteProfile(id);
    
    if (result.success) {
      addNotification('Профиль успешно удален', 'success');
    } else {
      addNotification(result.error, 'error');
    }
  };

  const handleBulkDelete = async (profileIds) => {
    if (!confirm(`Вы уверены, что хотите удалить ${profileIds.length} профилей?`)) {
      return;
    }

    const result = await bulkDeleteProfiles(profileIds);
    
    if (result.success) {
      addNotification(`Удалено ${profileIds.length} профилей`, 'success');
    } else {
      addNotification(result.error, 'error');
    }
  };

  // Filter profiles based on search and filters
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || profile.status === statusFilter;
    const matchesCountry = !countryFilter || 
                          profile.registration_country === countryFilter || 
                          profile.ip_country === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });

  if (loading && profiles.length === 0) {
    return <LoadingSpinner text="Загрузка профилей для продажи..." />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <ProfileStats stats={stats} category="for_sale" />

      {/* Custom Fields Info */}
      {customFields.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-blue-400 mr-2"></i>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              В этой категории доступны дополнительные поля: {customFields.map(f => f.name).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Поиск профилей для продажи..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white sm:text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Все статусы</option>
                <option value="active">Активный</option>
                <option value="inactive">Неактивный</option>
                <option value="banned">Заблокирован</option>
                <option value="pending">На проверке</option>
                <option value="sold">Продан</option>
              </select>

              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Все страны</option>
                <option value="Россия">Россия</option>
                <option value="Украина">Украина</option>
                <option value="Казахстан">Казахстан</option>
                <option value="Беларусь">Беларусь</option>
              </select>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <i className="fas fa-plus mr-2"></i>
            Создать профиль для продажи
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

      {/* Profile List */}
      <ProfileList
        profiles={filteredProfiles}
        category="for_sale"
        customFields={customFields}
        onEdit={setEditingProfile}
        onDelete={handleDeleteProfile}
        onBulkDelete={handleBulkDelete}
        loading={loading}
      />

      {/* Create/Edit Form Modal */}
      {(showForm || editingProfile) && (
        <ProfileForm
          profile={editingProfile}
          category="for_sale"
          customFields={customFields}
          onSubmit={editingProfile ? 
            (data) => handleUpdateProfile(editingProfile.id, data) : 
            handleCreateProfile
          }
          onCancel={() => {
            setShowForm(false);
            setEditingProfile(null);
          }}
        />
      )}
    </div>
  );
};

export default ForSaleProfiles;