import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useSocket } from '../../contexts/SocketContext';

const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotification();
  const { notifications: socketNotifications, removeNotification: removeSocketNotification } = useSocket();

  const allNotifications = [...notifications, ...socketNotifications];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle text-green-500';
      case 'error':
        return 'fas fa-exclamation-circle text-red-500';
      case 'warning':
        return 'fas fa-exclamation-triangle text-yellow-500';
      case 'reminder':
        return 'fas fa-bell text-blue-500';
      default:
        return 'fas fa-info-circle text-blue-500';
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'reminder':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  if (allNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {allNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg border shadow-lg transform transition-all duration-300
            ${getNotificationBg(notification.type)}
            animate-in slide-in-from-right-full
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.message || notification.title}
              </p>
              {notification.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {notification.description}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => {
                  if (notification.socket) {
                    removeSocketNotification(notification.id);
                  } else {
                    removeNotification(notification.id);
                  }
                }}
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;