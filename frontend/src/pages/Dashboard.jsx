import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import NotificationCenter from '../components/Layout/NotificationCenter';
import PersonalProfiles from './PersonalProfiles';
import ForSaleProfiles from './ForSaleProfiles';
import EmailManager from './EmailManager';
import FieldManager from './FieldManager';
import StatusManager from './StatusManager';
import UserManager from './UserManager';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Загрузка системы..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'Личные профили';
      case '/for-sale':
        return 'Профили для продажи';
      case '/emails':
        return 'Управление email';
      case '/fields':
        return 'Настройки полей';
      case '/statuses':
        return 'Настройки статусов';
      case '/users':
        return 'Управление пользователями';
      default:
        return 'Панель управления';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col z-50 md:hidden transform transition duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex-1 flex flex-col w-64">
          <Sidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <Header />
        
        <main className="flex-1 pb-8">
          {/* Page header */}
          <div className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <i className="fas fa-bars h-6 w-6"></i>
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-4 md:ml-0">
                    {getPageTitle()}
                  </h1>
                </div>
                
                {/* User welcome */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Добро пожаловать, <span className="font-medium text-gray-900 dark:text-white">{user?.username}</span>
                  </span>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <Routes>
                <Route path="/" element={<PersonalProfiles />} />
                <Route path="/for-sale" element={<ForSaleProfiles />} />
                <Route path="/emails" element={<EmailManager />} />
                <Route path="/fields" element={<FieldManager />} />
                <Route path="/statuses" element={<StatusManager />} />
                <Route path="/users" element={<UserManager />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationCenter />
    </div>
  );
};

export default Dashboard;