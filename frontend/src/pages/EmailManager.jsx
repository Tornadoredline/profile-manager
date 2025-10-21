import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import EmailStats from '../components/Emails/EmailStats';
import EmailList from '../components/Emails/EmailList';
import EmailForm from '../components/Emails/EmailForm';
import BulkEmailImport from '../components/Emails/BulkEmailImport';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const EmailManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    emails, 
    loading, 
    error, 
    stats, 
    createEmail, 
    bulkCreateEmails,
    updateEmail, 
    deleteEmail,
    fetchEmails 
  } = useEmails();

  const { addNotification } = useNotification();
  const { isAdmin } = useAuth();

  const handleCreateEmail = async (emailData) => {
    const result = await createEmail(emailData);

    if (result.success) {
      addNotification('Email успешно добавлен', 'success');
      setShowForm(false);
    } else {
      addNotification(result.error, 'error');
    }
  };

  const handleBulkImport = async (emailsData) => {
    const result = await bulkCreateEmails(emailsData);

    if (result.success) {
      addNotification(`Успешно добавлено ${result.result.successful.length} email-ов`, 'success');
      setShowBulkImport(false);
    } else {
      addNotification(result.error, 'error');
    }
  };

  const handleUpdateEmail = async (id, emailData) => {
    const result = await updateEmail(id, emailData);
    
    if (result.success) {
      addNotification('Email успешно обновлен', 'success');
      setEditingEmail(null);
    } else {
      addNotification(result.error, 'error');
    }
  };

  const handleDeleteEmail = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот email?')) {
      return;
    }

    const result = await deleteEmail(id);
    
    if (result.success) {
      addNotification('Email успешно удален', 'success');
    } else {
      addNotification(result.error, 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const result = await updateEmail(id, { status: newStatus });
    
    if (result.success) {
      addNotification('Статус email обновлен', 'success');
    } else {
      addNotification(result.error, 'error');
    }
  };

  // Filter emails based on search and filters
  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || email.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEmails(page, 20, { status: statusFilter, search: searchTerm });
  };

  if (loading && emails.length === 0) {
    return <LoadingSpinner text="Загрузка email-ов..." />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <EmailStats stats={stats} />

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
                placeholder="Поиск email-ов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white sm:text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Все статусы</option>
              <option value="free">Свободен</option>
              <option value="used">Использован</option>
              <option value="blocked">Заблокирован</option>
            </select>
          </div>

          {/* Action Buttons */}
          {isAdmin() && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkImport(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-upload mr-2"></i>
                Импорт
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-plus mr-2"></i>
                Добавить email
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warning for non-admin users */}
      {!isAdmin() && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Ограниченный доступ
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>Вы можете только просматривать email-ы. Для управления обратитесь к администратору.</p>
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

      {/* Email List */}
      <EmailList
        emails={filteredEmails}
        onEdit={setEditingEmail}
        onDelete={handleDeleteEmail}
        onStatusChange={handleStatusChange}
        loading={loading}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isAdmin={isAdmin()}
      />

      {/* Create/Edit Form Modal */}
      {(showForm || editingEmail) && isAdmin() && (
        <EmailForm
          email={editingEmail}
          onSubmit={editingEmail ? 
            (data) => handleUpdateEmail(editingEmail.id, data) : 
            handleCreateEmail
          }
          onCancel={() => {
            setShowForm(false);
            setEditingEmail(null);
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && isAdmin() && (
        <BulkEmailImport
          onSubmit={handleBulkImport}
          onCancel={() => setShowBulkImport(false)}
        />
      )}
    </div>
  );
};

export default EmailManager;